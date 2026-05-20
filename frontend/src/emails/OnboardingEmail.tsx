import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components';

interface OnboardingEmailProps {
  studentName: string;
  projectName: string;
  domain: string;
  description: string;
  deadline: string;
  dashboardUrl: string;
}

export default function OnboardingEmail({ studentName, projectName, domain, description, deadline, dashboardUrl }: OnboardingEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your Project Is Ready, {studentName}!</Heading>
          <Text style={text}>You have been assigned to: <strong>{projectName}</strong></Text>
          <Section style={details}>
            <Text style={detailText}><strong>Domain:</strong> {domain}</Text>
            <Text style={detailText}><strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()}</Text>
            <Text style={detailText}><strong>Description:</strong> {description}</Text>
          </Section>
          <Text style={text}><strong>First steps:</strong></Text>
          <Text style={text}>1. Review the project milestones in your dashboard</Text>
          <Text style={text}>2. Start with the first milestone and mark it complete as you progress</Text>
          <Text style={text}>3. Submit your work when all milestones are done</Text>
          <Button href={dashboardUrl} style={button}>Open Dashboard</Button>
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
const details = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const detailText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const button = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', marginTop: '24px' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
