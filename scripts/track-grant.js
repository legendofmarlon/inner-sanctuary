/**
 * Grant Application Pipeline Tracker
 * Inner Sanctuary Wellness Foundation (IRS 501(c)(3) | EIN: 39-3757168)
 * 
 * Usage:
 *   node scripts/track-grant.js list
 *   node scripts/track-grant.js submit --id <grant-id> [--date YYYY-MM-DD] [--conf <id>] [--notes <text>]
 *   node scripts/track-grant.js update --id <grant-id> --status <STATUS> [--notes <text>]
 *   node scripts/track-grant.js sync-md
 */

const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.resolve(__dirname, '../reports/grant-application-tracker.json');
const MARKDOWN_PATH = path.resolve(__dirname, '../reports/grant-application-tracker.md');

function loadTracker() {
  if (!fs.existsSync(TRACKER_PATH)) {
    throw new Error(`Tracker file not found at ${TRACKER_PATH}`);
  }
  return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
}

function saveTracker(data) {
  data.lastUpdated = new Date().toISOString();
  // Recalculate summary counts
  const summary = {
    totalTracked: data.grants.length,
    readyToSubmit: data.grants.filter(g => g.status === 'READY_TO_SUBMIT').length,
    submitted: data.grants.filter(g => g.status === 'SUBMITTED').length,
    underReview: data.grants.filter(g => g.status === 'UNDER_REVIEW').length,
    awarded: data.grants.filter(g => g.status === 'AWARDED').length,
    declined: data.grants.filter(g => g.status === 'DECLINED').length
  };
  data.pipelineSummary = Object.assign({}, data.pipelineSummary, summary);

  fs.writeFileSync(TRACKER_PATH, JSON.stringify(data, null, 2), 'utf8');
  syncMarkdown(data);
}

function syncMarkdown(data) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  let md = `# 📊 Inner Sanctuary Wellness Foundation — Grant Application Tracker\n\n`;
  md += `**Last Updated:** ${dateStr} | **Status:** Active Pipeline  \n`;
  md += `**Tax Status:** IRS 501(c)(3) Public Charity (EIN: 39-3757168)  \n\n`;

  md += `### Pipeline Summary\n`;
  md += `- **Total Opportunities Tracked:** ${data.grants.length}\n`;
  md += `- **Ready to Submit:** ${data.pipelineSummary.readyToSubmit || 0}\n`;
  md += `- **Submitted & Awaiting Decision:** ${data.pipelineSummary.submitted || 0}\n`;
  md += `- **Under Review / Dialog:** ${data.pipelineSummary.underReview || 0}\n`;
  md += `- **Awarded Capital:** ${data.pipelineSummary.awarded || 0}\n\n`;

  md += `| ID | Grant & Funder | Amount | Status | Submitted | Confirmation / Notes | Next Action |\n`;
  md += `|:---|:---|:---|:---:|:---:|:---|:---|\n`;

  for (const g of data.grants) {
    const statusBadge = 
      g.status === 'AWARDED' ? '🟢 **AWARDED**' :
      g.status === 'SUBMITTED' ? '🟡 **SUBMITTED**' :
      g.status === 'UNDER_REVIEW' ? '🔵 **IN REVIEW**' :
      g.status === 'DECLINED' ? '⚪ DECLINED' :
      '🟠 **READY TO SUBMIT**';

    const subDate = g.dateSubmitted || '—';
    const notes = [g.confirmationId ? `Conf: ${g.confirmationId}` : '', g.notes].filter(Boolean).join(' | ') || '—';
    const action = g.nextFollowUpDate ? `Follow-up: ${g.nextFollowUpDate}` : (g.status === 'READY_TO_SUBMIT' ? `Submit via ${g.portalUrl}` : 'Awaiting funder update');

    md += `| \`${g.id}\` | **${g.name}**<br>_${g.funder}_ | ${g.amount} | ${statusBadge} | ${subDate} | ${notes} | ${action} |\n`;
  }

  md += `\n---\n*Auto-synchronized with \`reports/grant-application-tracker.json\` via \`scripts/track-grant.js\`.*`;
  fs.writeFileSync(MARKDOWN_PATH, md, 'utf8');
}

function listGrants() {
  const data = loadTracker();
  console.log('\n========================================================================');
  console.log('  INNER SANCTUARY WELLNESS FOUNDATION — GRANT APPLICATION TRACKER');
  console.log('========================================================================\n');
  console.log(`Summary: ${data.pipelineSummary.readyToSubmit} Ready to Submit | ${data.pipelineSummary.submitted} Submitted | ${data.pipelineSummary.awarded} Awarded\n`);

  data.grants.forEach((g, idx) => {
    console.log(`[${idx + 1}] ID: ${g.id}`);
    console.log(`    Name:    ${g.name}`);
    console.log(`    Amount:  ${g.amount} | Funder: ${g.funder}`);
    console.log(`    Status:  ${g.status} | Submitted: ${g.dateSubmitted || 'Not yet'}`);
    if (g.confirmationId) console.log(`    Conf ID: ${g.confirmationId}`);
    if (g.notes) console.log(`    Notes:   ${g.notes}`);
    console.log('------------------------------------------------------------------------');
  });
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = val;
    }
  }
  return parsed;
}

function main() {
  const action = process.argv[2] || 'list';
  const args = parseArgs(process.argv.slice(3));

  if (action === 'list' || action === 'status') {
    listGrants();
    return;
  }

  if (action === 'sync-md') {
    const data = loadTracker();
    syncMarkdown(data);
    console.log(`✅ Markdown tracker updated at: ${MARKDOWN_PATH}`);
    return;
  }

  if (action === 'submit') {
    if (!args.id) {
      console.error('Error: Please specify --id <grant-id>');
      process.exit(1);
    }
    const data = loadTracker();
    const grant = data.grants.find(g => g.id === args.id);
    if (!grant) {
      console.error(`Grant with ID "${args.id}" not found.`);
      process.exit(1);
    }
    grant.status = 'SUBMITTED';
    grant.dateSubmitted = args.date || new Date().toISOString().split('T')[0];
    if (args.conf) grant.confirmationId = args.conf;
    if (args.notes) grant.notes = args.notes;
    grant.responseStatus = 'Submitted — Awaiting Decision';

    saveTracker(data);
    console.log(`✅ Grant "${grant.name}" marked as SUBMITTED on ${grant.dateSubmitted}.`);
    return;
  }

  if (action === 'update' || action === 'respond') {
    if (!args.id) {
      console.error('Error: Please specify --id <grant-id>');
      process.exit(1);
    }
    const data = loadTracker();
    const grant = data.grants.find(g => g.id === args.id);
    if (!grant) {
      console.error(`Grant with ID "${args.id}" not found.`);
      process.exit(1);
    }
    if (args.status) grant.status = args.status.toUpperCase();
    if (args.notes) grant.notes = args.notes;
    if (args.resp) grant.responseStatus = args.resp;
    if (args.followup) grant.nextFollowUpDate = args.followup;

    saveTracker(data);
    console.log(`✅ Grant "${grant.name}" updated to status ${grant.status}.`);
    return;
  }

  console.log(`Unknown command "${action}". Use: list, submit, update, or sync-md.`);
}

if (require.main === module) {
  main();
}

module.exports = { loadTracker, saveTracker, syncMarkdown };
