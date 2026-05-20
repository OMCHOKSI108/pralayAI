import { StudentProject, Certificate } from '@/data/mockData';

const HR_NAME = 'Om Choksi';
const COMPANY = 'Hellware Technology Solutions';
const COMPANY_ADDRESS = 'Vadodara, Gujarat, India';

/**
 * Robust print helper executing pixel-perfect black-on-white documents and certificates
 * using isolated iframe printing to support OS-native "Save to PDF" with zero external assets.
 */

export function printProjectDefinition(project: StudentProject, studentName: string) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docId = `HW-DOC-${project.id.toUpperCase()}-26`;
  
  // Diagonal watermark: Hellware H Logo + HELLWARE label angled
  const watermarkSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
      <g transform='rotate(-35 110 110)' opacity='0.12'>
        <rect x='85' y='60' width='10' height='10' fill='%23888888' rx='5'/>
        <rect x='125' y='60' width='10' height='10' fill='%23888888' rx='5'/>
        <rect x='85' y='80' width='10' height='10' fill='%23888888' rx='5'/>
        <circle cx='110' cy='85' r='5' fill='%23888888'/>
        <rect x='125' y='80' width='10' height='10' fill='%23888888' rx='5'/>
        <rect x='85' y='100' width='10' height='10' fill='%23888888' rx='5'/>
        <rect x='125' y='100' width='10' height='10' fill='%23888888' rx='5'/>
        <text x='110' y='125' fill='%23555555' font-size='9' font-family='monospace' font-weight='900' text-anchor='middle'>HELLWARE VERIFIED</text>
      </g>
    </svg>
  `.replace(/\s+/g, ' ');

  const watermarkUrl = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkSvg)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Project Definition - ${project.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 20mm 15mm 20mm 15mm;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: #111111;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          line-height: 1.6;
          font-size: 11.5pt;
          background-image: url("${watermarkUrl}");
          background-repeat: repeat;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
        }

        /* Top-left Brand Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 5px;
          border-bottom: 2px solid #111111;
          margin-bottom: 30px;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot-matrix {
          display: grid;
          grid-template-columns: repeat(3, 10px);
          gap: 5px;
        }

        .dot-red {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #E94560;
        }

        .dot-gray {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #111111;
        }

        .logo-txt {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 2px;
          color: #111111;
          margin: 0;
        }

        .doc-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5pt;
          color: #555555;
          text-align: right;
        }

        /* Headings & Content */
        h1 {
          font-size: 22pt;
          font-weight: 900;
          text-transform: uppercase;
          margin-top: 0;
          margin-bottom: 5px;
          color: #111111;
          letter-spacing: -0.5px;
        }

        .domain-pill {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5pt;
          background-color: #f0f0f0;
          padding: 3px 10px;
          border: 1px solid #e0e0e0;
          font-weight: 700;
          margin-bottom: 25px;
          text-transform: uppercase;
        }

        h2 {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid #111111;
          padding-bottom: 4px;
          margin-top: 30px;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        p {
          margin: 0 0 15px 0;
          text-align: justify;
          font-weight: 300;
        }

        /* Tech stack pills */
        .tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }

        .tech-pill {
          font-family: 'JetBrains Mono', monospace;
          background-color: #111111;
          color: #ffffff;
          font-size: 8pt;
          padding: 4px 8px;
          font-weight: 500;
        }

        /* Milestone tables */
        .milestone-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px dashed #cccccc;
        }

        .milestone-checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid #111111;
          margin-top: 4px;
          flex-shrink: 0;
        }

        .milestone-txt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5pt;
        }

        .milestone-txt strong {
          color: #111111;
        }

        /* Objectives */
        ul {
          margin: 0;
          padding-left: 20px;
          margin-bottom: 20px;
        }

        li {
          margin-bottom: 6px;
        }

        /* Footer Information block */
        .doc-footer {
          margin-top: 60px;
          border-top: 1px solid #111111;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8pt;
          color: #666666;
        }

        /* Print specifications layout */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <div class="logo-box">
            <div class="logo-dot-matrix">
              <span class="dot-red"></span><span></span><span class="dot-red"></span>
              <span class="dot-red"></span><span class="dot-gray"></span><span class="dot-red"></span>
              <span class="dot-red"></span><span></span><span class="dot-red"></span>
            </div>
            <h3 class="logo-txt">HELLWARE</h3>
          </div>
          <div class="doc-meta">
            CODE: ${docId}<br>
            TRACKING SYSTEM SECURED
          </div>
        </div>

        <h1>${project.title}</h1>
        <div class="domain-pill">COHORT TRACK: ${project.domain}</div>

        <h2>I. Statement of Work & Abstract</h2>
        <p>${project.description}</p>
        <p>This definition outlines the constraints, milestones check registers, and sandbox deployment specifications of the assigned cohort system. The fellow is tasked with delivering authentic, production-grade source artifacts adhering fully to structural security and quality audits rules.</p>

        <h2>II. Required Technologies Index</h2>
        <div class="tech-list">
          ${project.techStack.map(ts => `<span class="tech-pill">${ts}</span>`).join('')}
        </div>

        <h2>III. Deliverables Objectives and Criteria</h2>
        <ul>
          <li><strong>Quality Code</strong>: Build highly robust TypeScript logic and clear, compliant package managers integrations.</li>
          <li><strong>Sealed Endpoints</strong>: Handshake credentials proxy vectors securely to avoid direct runtime API leaks.</li>
          <li><strong>Diagnostic Sandbox</strong>: Implement fluid visual diagnostics widgets reporting exact performance coordinates.</li>
        </ul>

        <h2>IV. Milestone Schedule Checkpoints</h2>
        <div class="milestones-container">
          ${(project.milestones || []).map((m, idx) => `
            <div class="milestone-item">
              <div class="milestone-checkbox"></div>
              <div class="milestone-txt">
                <strong>Checkpoint ${idx + 1}</strong>: ${m.text}. 
                <span style="color:#777;">Must be pushed to active public origin repository.</span>
              </div>
            </div>
          `).join('')}
        </div>

        <h2>V. Submission Guidelines Enforcement</h2>
        <p>The fellow must supply a public GitHub repository connection, real-time live static deploy page link, and comprehensive screenshots outlining the active user dashboard interface within the assigned submission timer window.</p>

        <div class="doc-footer">
          <div>
            FELLOW: ${studentName.toUpperCase()}<br>
            DATE ASSIGNED: ${dateStr}
          </div>
          <div>
            TRACKING ID: ${docId}<br>
            hellware.in // COHORT RECON
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  executeIframePrint(htmlContent);
}

export function printCertificate(cert: Certificate, studentName: string) {
  const dateStr = cert.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const duration = "2-Month";
  const startDate = "June 1, 2026";
  const endDateStr = "July 31, 2026";
  const certId = cert.id || `HW-CERT-${Date.now().toString(36).toUpperCase()}`;
  const verifyUrl = `hellware.in/verify/${certId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate of Completion - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        @page { size: A4 landscape; margin: 12mm; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .certificate {
          width: 100%;
          max-width: 277mm;
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .border-frame {
          border: 2px solid #1a1a1a;
          padding: 32px 40px;
          position: relative;
        }

        .border-frame::before {
          content: '';
          position: absolute;
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          border: 1px solid #d4d4d4;
          pointer-events: none;
        }

        .gold-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #1a1a1a 0%, #555555 50%, #1a1a1a 100%);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
        }

        .company-name {
          font-size: 18pt;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1a1a1a;
        }

        .company-sub {
          font-size: 7pt;
          font-weight: 500;
          color: #666;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .cert-meta {
          text-align: right;
          font-size: 7.5pt;
          color: #555;
          line-height: 1.6;
        }

        .cert-meta strong { color: #1a1a1a; }

        .badge-row {
          text-align: center;
          margin: 20px 0 10px;
        }

        .badge {
          display: inline-block;
          border: 1px solid #1a1a1a;
          padding: 5px 24px;
          font-size: 7.5pt;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1a1a1a;
        }

        .title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28pt;
          font-weight: 700;
          text-align: center;
          color: #1a1a1a;
          margin: 8px 0 4px;
          letter-spacing: 0.5px;
        }

        .title-line {
          width: 80px;
          height: 2px;
          background: #1a1a1a;
          margin: 8px auto;
        }

        .pre-text {
          text-align: center;
          font-size: 9pt;
          color: #444;
          font-weight: 400;
          margin: 10px 0 4px;
        }

        .student-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36pt;
          font-weight: 700;
          text-align: center;
          color: #1a1a1a;
          margin: 4px 0;
          letter-spacing: 0.5px;
        }

        .main-text {
          text-align: center;
          font-size: 9.5pt;
          line-height: 1.9;
          color: #333;
          max-width: 220mm;
          margin: 10px auto 16px;
          padding: 0 20px;
        }

        .main-text strong { color: #1a1a1a; }

        .details-grid {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 12px 0 20px;
          font-size: 8.5pt;
          color: #444;
        }

        .details-grid div { text-align: center; }
        .details-grid strong { display: block; color: #1a1a1a; font-size: 9pt; margin-bottom: 2px; }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #d4d4d4;
        }

        .signature-area {
          width: 260px;
        }

        .signature-line {
          border-bottom: 1.5px solid #1a1a1a;
          margin-bottom: 6px;
          height: 32px;
        }

        .sig-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 14pt;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 2px;
        }

        .sig-title {
          font-size: 7.5pt;
          color: #555;
          line-height: 1.5;
        }

        .sig-title strong { color: #1a1a1a; }

        .verify-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .verify-qr {
          width: 52px;
          height: 52px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #1a1a1a;
          padding: 3px;
        }

        .qr-w { background: #fff; }
        .qr-b { background: #1a1a1a; }

        .verify-text {
          font-size: 6.5pt;
          color: #555;
          line-height: 1.5;
        }

        .verify-text strong {
          color: #1a1a1a;
          display: block;
          font-size: 7pt;
          text-transform: uppercase;
        }

        .footer-note {
          text-align: center;
          font-size: 6pt;
          color: #999;
          margin-top: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="border-frame">
          <div class="gold-accent"></div>

          <div class="header">
            <div class="logo-section">
              <svg class="logo-icon" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="14" height="14" rx="2" fill="#1a1a1a"/>
                <rect x="20" y="2" width="14" height="14" rx="2" fill="#1a1a1a"/>
                <rect x="2" y="20" width="14" height="14" rx="2" fill="#1a1a1a"/>
                <rect x="38" y="20" width="14" height="14" rx="2" fill="#1a1a1a"/>
                <rect x="2" y="38" width="14" height="14" rx="2" fill="#1a1a1a"/>
                <rect x="20" y="38" width="14" height="14" rx="2" fill="#1a1a1a"/>
              </svg>
              <div>
                <div class="company-name">Hellware</div>
                <div class="company-sub">Technology Solutions</div>
              </div>
            </div>
            <div class="cert-meta">
              <strong>CERTIFICATE ID</strong><br>
              ${certId}<br>
              <strong>ISSUED</strong> ${dateStr}
            </div>
          </div>

          <div class="badge-row">
            <span class="badge">Certificate of Completion</span>
          </div>

          <div class="title-line"></div>

          <div class="pre-text">This is to proudly certify that</div>
          <div class="student-name">${studentName}</div>

          <div class="main-text">
            has successfully completed the <strong>${duration} Remote Internship Program</strong> in
            <strong>${cert.domain}</strong> at ${COMPANY}, having demonstrated exceptional skill and diligence
            in the execution of the project "<strong>${cert.projectName}</strong>"
            during the period <strong>${startDate}</strong> to <strong>${endDateStr}</strong>.
          </div>

          <div class="details-grid">
            <div><strong>Duration</strong>${duration}</div>
            <div><strong>Domain</strong>${cert.domain}</div>
            <div><strong>Project</strong>${cert.projectName}</div>
            <div><strong>Completed</strong>${endDateStr}</div>
          </div>

          <div class="footer">
            <div class="signature-area">
              <div class="signature-line"></div>
              <div class="sig-name">${HR_NAME}</div>
              <div class="sig-title">
                <strong>HR Manager</strong><br>
                ${COMPANY}<br>
                ${COMPANY_ADDRESS}
              </div>
            </div>

            <div class="verify-section">
              <div class="verify-qr">
                ${Array.from({ length: 49 }).map((_, i) =>
                  `<div class="${i % 7 === 0 || i % 5 === 2 || i === 24 ? 'qr-b' : 'qr-w'}"></div>`
                ).join('')}
              </div>
              <div class="verify-text">
                <strong>Verify Certificate</strong>
                Scan or visit<br>
                <span style="font-family:monospace;font-size:7pt;color:#1a1a1a;">${verifyUrl}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            This certificate is a testament to the recipient's dedication, technical acumen, and professional growth.
          </div>
        </div>
      </div>
    </body>
    </html>
  `.trim();

  executeIframePrint(htmlContent);
}

export function printLOR(studentName: string, domain: string, projectName: string, duration: string = '2-Month') {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lorId = `HW-LOR-${Date.now().toString(36).toUpperCase()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Letter of Recommendation - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        @page { size: A4 portrait; margin: 22mm 25mm; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 10.5pt;
          line-height: 1.7;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1a1a1a;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-title {
          font-size: 16pt;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .company-subtitle {
          font-size: 7pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .doc-meta {
          text-align: right;
          font-size: 7.5pt;
          color: #555;
          line-height: 1.6;
        }

        .doc-meta strong { color: #1a1a1a; }

        .date-line {
          text-align: right;
          font-size: 9pt;
          color: #444;
          margin-bottom: 20px;
        }

        .subject-line {
          font-size: 10pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 1px solid #d4d4d4;
        }

        .salutation {
          font-size: 10.5pt;
          margin-bottom: 14px;
        }

        .body-text {
          text-align: justify;
          margin-bottom: 12px;
        }

        .signature-block {
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px solid #d4d4d4;
        }

        .sig-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 16pt;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 2px;
        }

        .sig-title {
          font-size: 9pt;
          color: #555;
          line-height: 1.5;
        }

        .sig-title strong { color: #1a1a1a; }

        .footer-note {
          margin-top: 30px;
          font-size: 7pt;
          color: #999;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <svg width="32" height="32" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="14" height="14" rx="2" fill="#1a1a1a"/>
            <rect x="20" y="2" width="14" height="14" rx="2" fill="#1a1a1a"/>
            <rect x="2" y="20" width="14" height="14" rx="2" fill="#1a1a1a"/>
            <rect x="38" y="20" width="14" height="14" rx="2" fill="#1a1a1a"/>
            <rect x="2" y="38" width="14" height="14" rx="2" fill="#1a1a1a"/>
            <rect x="20" y="38" width="14" height="14" rx="2" fill="#1a1a1a"/>
          </svg>
          <div>
            <div class="company-title">Hellware</div>
            <div class="company-subtitle">Technology Solutions</div>
          </div>
        </div>
        <div class="doc-meta">
          <strong>REF:</strong> ${lorId}<br>
          <strong>DATE:</strong> ${dateStr}
        </div>
      </div>

      <div class="date-line">${dateStr}</div>

      <div class="subject-line">Letter of Recommendation</div>

      <p class="salutation">To Whom It May Concern,</p>

      <p class="body-text">
        I am pleased to write this letter of recommendation for <strong>${studentName}</strong>, who has successfully completed a <strong>${duration} Remote Internship Program</strong> in the domain of <strong>${domain}</strong> at ${COMPANY}.
      </p>

      <p class="body-text">
        During the internship, ${studentName} demonstrated exceptional technical aptitude, professional maturity, and a strong commitment to excellence. They were entrusted with the project "<strong>${projectName}</strong>", which they executed with remarkable precision, delivering high-quality code, comprehensive documentation, and innovative solutions to complex problems.
      </p>

      <p class="body-text">
        ${studentName} consistently exceeded expectations in areas including analytical reasoning, collaborative problem-solving, and independent research. Their ability to grasp advanced concepts quickly and apply them effectively in real-world scenarios was truly impressive. They showed great initiative in optimizing workflows and contributed meaningfully to our technical discussions.
      </p>

      <p class="body-text">
        Beyond technical skills, ${studentName} displayed outstanding professionalism, punctuality, and a collaborative spirit that made them a valuable member of our team. They communicated effectively with peers and mentors alike, and demonstrated leadership potential that will serve them well in their future endeavors.
      </p>

      <p class="body-text">
        I am confident that ${studentName} possesses the skills, dedication, and intellectual curiosity to excel in any academic or professional pursuit they choose to undertake. I recommend them without reservation and would be happy to provide further details if needed.
      </p>

      <p class="body-text">Please feel free to contact me at omchoksi.pro@gmail.com for any additional information.</p>

      <div class="signature-block">
        <div class="sig-name">${HR_NAME}</div>
        <div class="sig-title">
          <strong>HR Manager</strong><br>
          ${COMPANY}<br>
          ${COMPANY_ADDRESS}
        </div>
      </div>

      <div class="footer-note">
        This letter is issued by Hellware Technology Solutions and reflects our genuine assessment of the candidate.
      </div>
    </body>
    </html>
  `.trim();

  executeIframePrint(htmlContent);
}

export function printOfferLetter(
  studentName: string, 
  domain: string, 
  durationMonths: number, 
  stipend: string, 
  dateStr?: string,
  collegeName: string = "International Institute of Information Technology",
  cityState: string = "Vadodara, Gujarat"
) {
  const dateFormatted = dateStr || "May 20, 2026";
  const offerRefEnd = Math.floor(100 + Math.random() * 900);
  const offerRef = `HW/INT/2026/0${offerRefEnd}`;

  const startD = "June 1, 2026";
  let endD = "July 31, 2026";
  if (durationMonths === 1) endD = "June 30, 2026";
  else if (durationMonths === 2) endD = "July 31, 2026";
  else if (durationMonths === 3) endD = "August 31, 2026";
  else if (durationMonths === 4) endD = "September 30, 2026";
  else if (durationMonths === 6) endD = "November 30, 2026";

  const watermarkSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'>
      <g transform='rotate(-30 140 140)' opacity='0.08'>
        <rect x='115' y='95' width='12' height='12' fill='%23666666' rx='1.5'/>
        <rect x='132' y='95' width='12' height='12' fill='%23666666' rx='1.5'/>
        <rect x='115' y='112' width='12' height='12' fill='%23666666' rx='1.5'/>
        <rect x='149' y='112' width='12' height='12' fill='%23666666' rx='1.5'/>
        <rect x='115' y='129' width='12' height='12' fill='%23666666' rx='1.5'/>
        <rect x='132' y='129' width='12' height='12' fill='%23666666' rx='1.5'/>
        <text x='140' y='165' fill='%23555555' font-size='12' font-family='sans-serif' font-weight='900' text-anchor='middle'>HELLWARE</text>
      </g>
    </svg>
  `.replace(/\s+/g, ' ');

  const watermarkUrl = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkSvg)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Corporate Offer Letter - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 25mm 20mm 20mm 20mm;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          line-height: 1.6;
          font-size: 10.5pt;
          background-image: url("${watermarkUrl}");
          background-repeat: repeat;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
          position: relative;
        }

        /* Top Brand Header Block */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 12px;
          margin-bottom: 25px;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

  .company-details {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

        .comp-name {
          font-size: 13pt;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #000000;
          margin: 0 0 2px 0;
        }

        .comp-meta {
          font-size: 8.5pt;
          color: #333333;
          line-height: 1.4;
        }

        .header-rule {
          border-bottom: 1px solid #E94560;
          margin-bottom: 25px;
        }

        /* Document Metadata block */
        .doc-meta {
          text-align: right;
          font-size: 9.5pt;
          color: #000000;
          line-height: 1.5;
          margin-bottom: 30px;
        }

        /* Recipient address block */
        .recipient-block {
          text-align: left;
          font-size: 10.5pt;
          color: #000000;
          line-height: 1.5;
          margin-bottom: 30px;
        }

        .recipient-name {
          font-weight: 700;
        }

        /* Subject block */
        .subject-line {
          font-weight: 700;
          text-decoration: underline;
          margin-bottom: 25px;
          text-align: left;
          font-size: 11pt;
          text-transform: uppercase;
          letter-spacing: -0.2px;
        }

        .salutation {
          font-weight: 700;
          margin-bottom: 15px;
          text-align: left;
        }

        p {
          margin: 0 0 15px 0;
          text-align: justify;
        }

        /* Modern A4 Summary table */
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
        }

        .details-table th, .details-table td {
          border: 1px solid #111111;
          padding: 8px 12px;
          font-size: 10pt;
          text-align: left;
        }

        .details-table td:first-child {
          font-weight: 700;
          width: 35%;
        }

        .details-table td:last-child {
          font-weight: normal;
        }

        /* Closing blocks */
        .closing-section {
          margin-top: 35px;
          text-align: left;
        }

        .signature {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 16pt;
          color: #000000;
          margin: 8px 0 12px 0;
        }

        .signatory-info {
          font-size: 9.5pt;
          color: #333333;
          line-height: 1.5;
        }

        /* Footer block strictly on page bottom */
        .footer {
          position: absolute;
          bottom: -40px;
          left: 0;
          right: 0;
          border-top: 1px solid #111111;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #555555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <div class="logo-box">
            <svg width="36" height="36" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="14" height="14" rx="2" fill="#E94560" />
              <rect x="18" y="0" width="14" height="14" rx="2" fill="#E94560" />
              <rect x="0" y="18" width="14" height="14" rx="2" fill="#E94560" />
              <rect x="36" y="18" width="14" height="14" rx="2" fill="#E94560" />
              <rect x="0" y="36" width="14" height="14" rx="2" fill="#E94560" />
              <rect x="18" y="36" width="14" height="14" rx="2" fill="#E94560" />
            </svg>
            <div class="company-details">
              <div class="comp-name">Hellware Technology Solutions</div>
              <div class="comp-meta">
                123, Business Hub, Vadodara, Gujarat — 390001<br>
                Email: careers@hellware.in | Web: hellware.in
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-rule"></div>

        <div class="doc-meta">
          <strong>Date:</strong> ${dateFormatted}<br>
          <strong>Ref No:</strong> ${offerRef}
        </div>

        <div class="recipient-block">
          <span class="recipient-name">${studentName}</span><br>
          ${collegeName}<br>
          ${cityState}
        </div>

        <div class="subject-line">
          Subject: Internship Offer Letter — ${domain} Track | ${durationMonths}-Month Program
        </div>

        <div class="salutation">Dear ${studentName.split(' ')[0]},</div>

        <p>
          We are pleased to offer you the position of Software Engineering Intern at Hellware Technology Solutions. Following a review of your application and profile, we believe you will be a valuable contributor to our engineering internship program.
        </p>

        <table class="details-table">
          <tr>
            <td>Position</td>
            <td>Software Engineering Intern</td>
          </tr>
          <tr>
            <td>Domain</td>
            <td>${domain} Track</td>
          </tr>
          <tr>
            <td>Program Duration</td>
            <td>${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}</td>
          </tr>
          <tr>
            <td>Start Date</td>
            <td>${startD}</td>
          </tr>
          <tr>
            <td>End Date</td>
            <td>${endD}</td>
          </tr>
          <tr>
            <td>Mode of Work</td>
            <td>Remote</td>
          </tr>
          <tr>
            <td>Weekly Commitment</td>
            <td>15–20 hours</td>
          </tr>
          <tr>
            <td>Reporting To</td>
            <td>Engineering Internship Coordinator</td>
          </tr>
          <tr>
            <td>Evaluation Track</td>
            <td>Standard Academic Verification</td>
          </tr>
        </table>

        <p>
          During the course of this internship, you will be required to complete assigned project milestones, submit weekly progress reports every Monday, maintain professional conduct in all communications, and comply with Hellware's intellectual property and confidentiality guidelines. All project submissions must be original work.
        </p>

        <p>
          Upon successful completion of all milestones, submission approval, and program duration, you will receive a digitally verified Completion Certificate, a public Developer Profile page on hellware.in, and access to Hellware's engineering resource library. These documents may be used for academic credit and placement purposes.
        </p>

        <p>
          Please confirm your acceptance of this offer by logging into your Hellware dashboard at hellware.in/dashboard and clicking Accept Offer within 5 business days of receipt. This letter shall serve as the official record of your internship engagement with Hellware Technology Solutions.
        </p>

        <div class="closing-section">
          <p>Warm regards,</p>
          <div class="signature">Thorne Vance</div>
          <div class="signatory-info">
            <strong>Thorne Vance</strong><br>
            Head of Engineering Internships<br>
            Hellware Technology Solutions<br>
            careers@hellware.in | hellware.in
          </div>
        </div>

        <div class="footer">
          <div>Hellware Technology Solutions | hellware.in | careers@hellware.in</div>
          <div>Ref: ${offerRef} | Page 1 of 1</div>
        </div>

      </div>
    </body>
    </html>
  `.trim();

  executeIframePrint(htmlContent);
}

export function printWeeklyReport(
  weekNum: number,
  hoursLogged: number,
  locCount: number,
  achievements: string,
  blockers: string,
  milestonesText: string,
  studentName: string,
  email: string,
  domain: string
) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docId = `HW-WEEKLY-W${weekNum}-${Math.floor(100 + Math.random() * 900)}`;

  const watermarkSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
      <g transform='rotate(-35 110 110)' opacity='0.08'>
        <rect x='85' y='60' width='10' height='10' fill='%23666666' rx='5'/>
        <rect x='125' y='60' width='10' height='10' fill='%23666666' rx='5'/>
        <rect x='85' y='80' width='10' height='10' fill='%23666666' rx='5'/>
        <circle cx='110' cy='85' r='5' fill='%23666666'/>
        <rect x='125' y='80' width='10' height='10' fill='%23666666' rx='5'/>
        <rect x='85' y='100' width='10' height='10' fill='%23666666' rx='5'/>
        <rect x='125' y='100' width='10' height='10' fill='%23666666' rx='5'/>
        <text x='110' y='125' fill='%23555555' font-size='8' font-family='monospace' font-weight='900' text-anchor='middle'>VERIFIED WEEKLY PROGRESS</text>
      </g>
    </svg>
  `.replace(/\s+/g, ' ');

  const watermarkUrl = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkSvg)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Weekly Progress Report - Week ${weekNum}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: #111111;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          line-height: 1.5;
          font-size: 10.5pt;
          background-image: url("${watermarkUrl}");
          background-repeat: repeat;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 5px;
          border-bottom: 2px solid #111111;
          margin-bottom: 25px;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot-matrix {
          display: grid;
          grid-template-columns: repeat(3, 8px);
          gap: 4px;
        }

        .dot-red {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #E94560;
        }

        .dot-black {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #111111;
        }

        .logo-txt {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 2px;
          color: #111111;
          margin: 0;
        }

        .doc-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8pt;
          color: #555555;
          text-align: right;
        }

        h1 {
          font-size: 18pt;
          font-weight: 900;
          text-transform: uppercase;
          margin-top: 0;
          margin-bottom: 5px;
          color: #111111;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9pt;
          color: #666666;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 25px;
          border: 1px solid #111111;
          background-color: #fafafa;
        }

        .detail-item {
          padding: 8px 12px;
          border: 1px solid rgba(0,0,0,0.06);
          font-size: 9.5pt;
        }

        .detail-item strong {
          font-family: 'JetBrains Mono', monospace;
          color: #555555;
          display: block;
          font-size: 8pt;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        h2 {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid #111111;
          padding-bottom: 3px;
          margin-top: 25px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        p {
          margin: 0 0 12px 0;
          text-align: justify;
          color: #222222;
        }

        .report-block {
          padding: 10px 15px;
          background-color: #fcfcfc;
          border-left: 3px solid #E94560;
          font-family: 'Inter', sans-serif;
          font-size: 10pt;
          margin-bottom: 15px;
          white-space: pre-line;
        }

        .metrics-row {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .metric-box {
          flex: 1;
          border: 1px solid #e0e0e0;
          padding: 10px;
          background-color: #fdfdfd;
          text-align: center;
        }

        .metric-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 18pt;
          font-weight: 750;
          color: #E94560;
        }

        .metric-label {
          font-family: 'Inter', sans-serif;
          font-size: 7.5pt;
          color: #666666;
          text-transform: uppercase;
          margin-top: 2px;
          font-weight: 600;
        }

        .signatures-grid {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 40px;
        }

        .signature-block {
          width: 180px;
        }

        .sig-line {
          border-bottom: 1px solid #111111;
          height: 35px;
        }

        .sig-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7.5pt;
          color: #666666;
          text-transform: uppercase;
          margin-top: 6px;
        }

        .doc-footer {
          margin-top: 45px;
          border-top: 1px solid #111111;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 7.5pt;
          color: #666666;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <div class="logo-box">
            <div class="logo-dot-matrix">
              <span class="dot-red"></span><span></span><span class="dot-red"></span>
              <span class="dot-red"></span><span class="dot-black"></span><span class="dot-red"></span>
              <span class="dot-red"></span><span></span><span class="dot-red"></span>
            </div>
            <h3 class="logo-txt">HELLWARE</h3>
          </div>
          <div class="doc-meta">
            LOG SERIAL: ${docId}<br>
            ACADEMIC PROGRESS VERIFIED ✓
          </div>
        </div>

        <h1>WEEKLY PROGRESS ANALYSIS</h1>
        <div class="subtitle">WEEKLY REVIEW PACKET: WEEK ${weekNum}</div>

        <div class="details-grid">
          <div class="detail-item">
            <strong>COHORT FELLOW</strong>
            ${studentName}
          </div>
          <div class="detail-item">
            <strong>SPECIALIZATION DOMAIN</strong>
            ${domain}
          </div>
          <div class="detail-item">
            <strong>REGISTERED CORRESPONDENCE</strong>
            ${email}
          </div>
          <div class="detail-item">
            <strong>GENERATE DATE (UTC)</strong>
            ${dateStr}
          </div>
        </div>

        <h2>I. Development & Time Metrics</h2>
        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-value">${hoursLogged} Hrs</div>
            <div class="metric-label">HOURS INVESTED</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">${locCount} lines</div>
            <div class="metric-label">LOC AUTHORED</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">Week ${weekNum}</div>
            <div class="metric-label">CURRENT ITERATION</div>
          </div>
        </div>

        <h2>II. Accomplishments and Architectural Milestones</h2>
        <div class="report-block">${achievements}</div>

        <h2>III. Core Systems Blockers Identified</h2>
        <div class="report-block" style="border-left-color: #666;">${blockers || 'No blocking states reported during this cycle.'}</div>

        <h2>IV. Active Checked Milestones State</h2>
        <p>The fellow has integrated, reviewed, and ticked the following checkpoints:</p>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 9pt; background: #fafafa; border: 1px solid #e0e0e0; padding: 10px 15px; margin-bottom: 25px;">
          ${milestonesText || '• Default initialization verified successfully.'}
        </div>

        <div class="signatures-grid">
          <div class="signature-block">
            <div class="sig-line"></div>
            <div class="sig-label">Fellow Signature</div>
          </div>
          <div class="signature-block">
            <div class="sig-line" style="border-bottom: 1px dashed #777;"></div>
            <div class="sig-label">Academic Faculty Signee</div>
          </div>
          <div class="signature-block">
            <div class="sig-line" style="border-bottom: 1px solid #666;"></div>
            <div class="sig-label">Hellware Mentor Signoff</div>
          </div>
        </div>

        <div class="doc-footer">
          <div>
            TRACK_ID: ${docId}<br>
            VERIFIED STAMP LEDGER
          </div>
          <div>
            hellware.in // academic-credit-portal<br>
            SECURE INTEGRITY CONTROL
          </div>
        </div>

      </div>
    </body>
    </html>
  `.trim();

  executeIframePrint(htmlContent);
}

function executeIframePrint(html: string) {
  // Safe embedded print queue using iframe
  const frameId = 'hellware-print-iframe';
  let printFrame = document.getElementById(frameId) as HTMLIFrameElement;
  
  if (printFrame) {
    document.body.removeChild(printFrame);
  }

  printFrame = document.createElement('iframe');
  printFrame.id = frameId;
  printFrame.style.position = 'fixed';
  printFrame.style.bottom = '0';
  printFrame.style.right = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch {
        const fallbackWin = window.open();
        if (fallbackWin) {
          fallbackWin.document.write(html);
        }
      }
    }, 750);
  }
}

