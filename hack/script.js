document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeInfo = document.getElementById('mode-info');
    const urlInput = document.getElementById('url-input');
    const auditBtn = document.getElementById('audit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsSection = document.getElementById('results-section');
    const errorMessage = document.getElementById('error-message');
    const testAgainBtn = document.querySelector('.test-again-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const issuesSummaryContainer = document.querySelector('.summary-card #issues-summary');

    let selectedMode = 'desktop';

    const getScoreColorClass = (score) => {
        if (score >= 80) return 'good';
        if (score >= 50) return 'needs-improvement';
        return 'bad';
    };

    const getGradeClass = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    const createRecommendationCard = (title, description, severity) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        let badgeClass = severity.toLowerCase() === 'critical' ? 'high' : (severity.toLowerCase() === 'minor' ? 'medium' : 'low');
        card.innerHTML = `
            <div class="badge ${badgeClass}">${severity}</div>
            <div class="content">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
        `;
        return card;
    };

    const populateList = (issues, listElementId) => {
        const list = document.getElementById(listElementId);
        if (!list) return;
        list.innerHTML = '';
        if (!issues || issues.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No issues found in this category.';
            list.appendChild(li);
        } else {
            issues.forEach(issue => {
                const li = document.createElement('li');
                li.textContent = issue;
                list.appendChild(li);
            });
        }
    };

    // Mode buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedMode = button.getAttribute('data-mode');
            modeInfo.textContent = `Mode: ${selectedMode}`;
        });
    });

    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.id === `${tabId}-tab` ? content.classList.remove('hidden') : content.classList.add('hidden');
            });
        });
    });

    // Audit button
    auditBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            errorMessage.textContent = "Please enter a URL to audit.";
            errorMessage.classList.remove('hidden');
            return;
        }
        errorMessage.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        auditBtn.disabled = true;
        document.querySelector('.input-container').style.display = 'none';

        try {
            const response = await fetch('/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, mode: selectedMode })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unknown error');
            }

            loadingSpinner.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            // Summary cards
            document.getElementById('report-url').textContent = result.url;
            document.getElementById('report-url').href = result.url;
            document.getElementById('report-datetime').textContent = new Date(result.timestamp).toLocaleString();
            document.getElementById('overall-score-summary').textContent = result.overall?.score ?? 'N/A';
            document.getElementById('overall-grade-badge').textContent = result.overall?.grade ?? 'N/A';
            document.getElementById('overall-grade-badge').className = `grade-badge ${getGradeClass(result.overall?.score ?? 0)}`;

            document.getElementById('fop-value').textContent = `FOP: ${result.performance?.metrics?.fcp ?? 'N/A'}ms`;
            document.getElementById('lcp-value').textContent = `LCP: ${result.performance?.metrics?.lcp ?? 'N/A'}ms`;

            document.getElementById('critical-issues-count').textContent = `${result.issues_count?.critical ?? 0} Critical`;
            document.getElementById('minor-issues-count').textContent = `${result.issues_count?.minor ?? 0} Minor`;

            document.getElementById('security-status-badge').textContent = result.security?.ssl_valid ? 'HTTPS' : 'HTTP';
            document.getElementById('security-status-badge').className = `security-status-badge ${result.security?.ssl_valid ? 'secure' : 'insecure'}`;

            // Scores bars
            const scoreItems = ['performance', 'seo', 'accessibility'];
            scoreItems.forEach(item => {
                const scoreVal = result[item]?.score ?? 0;
                document.getElementById(`${item}-score-value`).textContent = scoreVal;
                document.getElementById(`${item}-score-bar`).style.width = `${scoreVal}%`;
                document.getElementById(`${item}-score-bar`).className = `bar-fill ${getScoreColorClass(scoreVal)}`;
            });

            // Compute grades for performance & accessibility
            document.getElementById('performance-grade').textContent = getGradeClass(result.performance?.score ?? 0);
            document.getElementById('accessibility-grade').textContent = getGradeClass(result.accessibility?.score ?? 0);

            // Quick Recommendations
            const allIssues = [
                ...(result.security?.issues ?? []).map(i => ({ text: i, category: 'Security' })),
                ...(result.performance?.issues ?? []).map(i => ({ text: i, category: 'Performance' })),
                ...(result.seo?.issues ?? []).map(i => ({ text: i, category: 'SEO' })),
                ...(result.accessibility?.issues ?? []).map(i => ({ text: i, category: 'Accessibility' }))
            ];
            const recommendationsList = document.getElementById('recommendations-list');
            recommendationsList.innerHTML = '';

            if (allIssues.length > 0) {
                allIssues.forEach(issue => {
                    const severity = issue.text.includes('Missing') || issue.text.includes('Invalid') || issue.text.includes('High') ? 'Critical' : 'Minor';
                    const card = createRecommendationCard(issue.category + ' Issue', issue.text, severity);
                    recommendationsList.appendChild(card);
                });
            } else {
                const msg = document.createElement('p');
                msg.textContent = "Great! No major issues found.";
                recommendationsList.appendChild(msg);
            }

            // Populate detailed tabs
            populateList(result.performance?.issues ?? [], 'performance-recommendations-list');
            populateList(result.accessibility?.issues ?? [], 'accessibility-issues-list');
            populateList(result.security?.issues ?? [], 'security-issues-list');

        } catch (error) {
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            document.querySelector('.input-container').style.display = 'block';
        } finally {
            auditBtn.disabled = false;
        }
    });

    // Test Again button
    testAgainBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        auditBtn.disabled = false;
        urlInput.value = '';
        document.querySelector('.input-container').style.display = 'block';
    });

    // Issues summary click
    if (issuesSummaryContainer) {
        issuesSummaryContainer.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            const overviewButton = document.querySelector('[data-tab="overview"]');
            if (overviewButton) overviewButton.classList.add('active');
            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById('overview-tab')?.classList.remove('hidden');
            document.querySelector('.quick-recommendations')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
