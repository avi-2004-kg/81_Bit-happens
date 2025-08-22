WebPulse 360

WebPulse 360 is a comprehensive website auditing platform that evaluates websites for security vulnerabilities, performance bottlenecks, SEO issues, and accessibility compliance. It provides website owners with actionable insights and recommendations to improve security, speed, visibility, and usability.

Features:
Security Analysis
1. Checks SSL/TLS certificate validity
2. Detects missing security headers
3. Evaluates cookie flags and phishing risk

Performance Analysis:
1. Measures page load time and size
2. Simulates Core Web Vitals: LCP, FCP, CLS
3. Detects performance bottlenecks

SEO Analysis:
1. Checks title, meta description, and headings
2. Detects Open Graph tags for social media
3. Verifies presence of robots.txt and sitemap.xml

Accessibility Analysis:
1. Detects missing alt tags in images
2. Checks for h1 tag and lang attributes
3. Flags links with empty or missing text

Reporting:
1. Generates an overall score with letter grades
2. Lists critical and minor issues
3. Allows PDF export of audit results

Tech Stack:
Frontend
1. HTML5, CSS3, JavaScript
2. Libraries: html2canvas, jsPDF

Backend
1. Python 3.x with Flask
2. Libraries: BeautifulSoup, requests
3. CORS enabled for API requests

How It Works:
1. User enters a website URL in the frontend.
2. Flask backend normalizes the URL and fetches the website content.
3. The system performs security, performance, SEO, and accessibility analyses.
4. Scores are calculated for each category using weighted metrics.
5. Overall score and recommendations are returned as JSON and displayed in the frontend.
6. Users can download a PDF report with detailed results.

Installation
# Clone the repository
git clone https://github.com/your-username/webpulse360.git
cd webpulse360

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py


Frontend runs at http://localhost:5000 by default.

Usage:
1. Open the web application in a browser.
2. Enter a valid website URL in the input box.
3. Click “Audit” to start the analysis.
4. View scores, issues, and recommendations.
5. Optionally, download the PDF report.

Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch (git checkout -b feature-name)
3. Commit your changes (git commit -m 'Add new feature')
4. Push to the branch (git push origin feature-name)
5. Open a pull request

License

This project is licensed under the MIT License.
