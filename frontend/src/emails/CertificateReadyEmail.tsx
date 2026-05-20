import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components';

interface CertificateReadyEmailProps {
  studentName: string;
  projectName: string;
  certId: string;
  verifyUrl: string;
  dashboardUrl: string;
}

export default function CertificateReadyEmail({ studentName, projectName, certId, verifyUrl, dashboardUrl }: CertificateReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🎓 Your Certificate Is Ready!</Heading>
          <Text style={text}>Congratulations, {studentName}!</Text>
          <Text style={text}>You have successfully completed <strong>{projectName}</strong> and earned your Hellware certificate.</Text>
          <Section style={certBox}>
            <Text style={certText}><strong>Certificate ID:</strong> {certId}</Text>
            <Text style={certText}><strong>Project:</strong> {projectName}</Text>
          </Section>
          <div style={buttonGroup}>
            <Button href={dashboardUrl} style={button}>Download Certificate</Button>
            <Button href={verifyUrl} style={secondaryButton}>Verify Certificate</Button>
          </div>
          <Hr style={hr} />
          <Text style={footer}>Hellware — Build. Learn. Ship.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#0a0a0a', fontFamily: '-apple-system, sans-serif' };
const container = { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' };
const heading = { color: '#ffffff', fontSize: '28px', marginTop: '24px' };
const text = { color: '#a1a1aa', fontSize: '16px', lineHeight: '24px' };
const certBox = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const certText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const buttonGroup = { display: 'flex', gap: '12px', marginTop: '24px' };
const button = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' };
const secondaryButton = { backgroundColor: 'transparent', color: '#2563eb', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', border: '1px solid #2563eb' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
