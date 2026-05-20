import { StudentProject, Certificate } from '@/data/mockData';

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
  const dateStr = cert.completionDate || "May 20, 2026";
  const duration = "2-Month";
  const startDate = "June 1, 2026";
  const endDateStr = "July 31, 2026";
  const certId = cert.id || "HW-CERT-2026-0421";
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate Of Completion - ${studentName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;700;900&display=swap');
        
        @page {
          size: A4 landscape;
          margin: 15mm;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: #000000;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .cert-frame {
          border: 1px solid #000000;
          padding: 40px 50px;
          width: 100%;
          max-width: 260mm;
          box-sizing: border-box;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 35px;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-text {
          font-family: 'Inter', sans-serif;
          font-weight: 950;
          font-size: 16pt;
          letter-spacing: 1.5px;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }

        .cert-id {
          font-family: 'Inter', sans-serif;
          font-size: 8.5pt;
          color: #111111;
          text-align: right;
          line-height: 1.4;
        }

        h1 {
          font-family: 'Inter', sans-serif;
          font-size: 12pt;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 0;
          margin-bottom: 25px;
          color: #000000;
        }

        .student-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 32pt;
          margin: 20px 0;
          color: #000000;
          text-align: center;
        }

        .cert-text {
          font-family: 'Inter', sans-serif;
          font-size: 11pt;
          line-height: 1.8;
          color: #000000;
          max-width: 220mm;
          margin: 20px auto 40px auto;
          text-align: center;
        }

        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 40px;
          border-top: 1px solid #000000;
          padding-top: 25px;
        }

        .signature-col {
          text-align: left;
          width: 250px;
        }

        .sig-image-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 17pt;
          color: #000000;
          margin-bottom: 6px;
        }

        .signature-line {
          border-bottom: 1px solid #000000;
          margin-bottom: 8px;
        }

        .signatory-label {
          font-family: 'Inter', sans-serif;
          font-size: 8pt;
          color: #444444;
          line-height: 1.4;
        }

        .qr-col {
          display: flex;
          align-items: center;
          gap: 15px;
          text-align: left;
        }

        /* Minimal QR Block */
        .qr-box {
          width: 55px;
          height: 55px;
          background-color: #000000;
          padding: 4px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          box-sizing: border-box;
        }

        .qr-px-w {
          background-color: #ffffff;
        }

        .qr-px-b {
          background-color: #000000;
        }

        .qr-info {
          font-family: 'Inter', sans-serif;
          font-size: 7.5pt;
          color: #444444;
          line-height: 1.4;
        }

        .qr-info strong {
          color: #000000;
        }
      </style>
    </head>
    <body>
      <div class="cert-frame">
        <div class="header">
          <div class="logo-box">
            <svg width="24" height="24" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="14" height="14" rx="1" fill="#000000" />
              <rect x="18" y="0" width="14" height="14" rx="1" fill="#000000" />
              <rect x="0" y="18" width="14" height="14" rx="1" fill="#000000" />
              <rect x="36" y="18" width="14" height="14" rx="1" fill="#000000" />
              <rect x="0" y="36" width="14" height="14" rx="1" fill="#000000" />
              <rect x="18" y="36" width="14" height="14" rx="1" fill="#000000" />
            </svg>
            <h3 class="logo-text">Hellware</h3>
          </div>
          <div class="cert-id">
            Issued on: ${dateStr}<br>
            Certificate ID: ${certId}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <h1>Certificate Of Completion</h1>
          
          <div class="student-name">${studentName}</div>
          
          <div class="cert-text">
            This is to certify that <strong>${studentName}</strong> has successfully completed the <strong>${duration}</strong> Remote Internship Program in the domain of <strong>${cert.domain}</strong> at Hellware Technology Solutions having completed the project "<strong>${cert.projectName}</strong>" during the period <strong>${startDate}</strong> to <strong>${endDateStr}</strong>.
          </div>
        </div>

        <div class="footer-row">
          <div class="signature-col">
            <div class="sig-image-text">Thorne Vance</div>
            <div class="signature-line"></div>
            <div class="signatory-label">
              <strong>Thorne Vance</strong><br>
              Head of Engineering Internships<br>
              Hellware Technology Solutions
            </div>
          </div>

          <div class="qr-col">
            <div class="qr-box">
              ${Array.from({ length: 36 }).map((_, r) => `
                <div class="${r % 3 === 0 || r % 5 === 1 ? 'qr-px-w' : 'qr-px-b'}"></div>
              `).join('')}
            </div>
            <div class="qr-info">
              <strong>SECURED COHORT DEPLOY</strong><br>
              Verification Link:<br>
              <span style="font-family: monospace;">hellware.in/verify/${certId}</span>
            </div>
          </div>
        </div>
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
          flex-col: column;
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
          align-align: flex-end;
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

    // Small delay to allow CSS loading and rendering before starting OS print
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    }, 750);
  }
}

