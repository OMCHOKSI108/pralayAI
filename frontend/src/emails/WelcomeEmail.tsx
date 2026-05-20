import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section, Img } from '@react-email/components';

interface WelcomeEmailProps {
  studentName: string;
  domain: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ studentName, domain, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Img src="https://hellware.in/logo.svg" alt="Hellware" width="40" height="40" />
          <Heading style={heading}>Welcome to Hellware, {studentName}!</Heading>
          <Text style={text}>You have been accepted into the <strong>{domain}</strong> domain.</Text>
          <Section style={steps}>
            <Text style={stepText}><strong>1.</strong> Log in to your dashboard</Text>
            <Text style={stepText}><strong>2.</strong> View your assigned project and milestones</Text>
            <Text style={stepText}><strong>3.</strong> Start building and submit your work for review</Text>
          </Section>
          <Button href={dashboardUrl} style={button}>Go to Dashboard</Button>
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
const steps = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const stepText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const button = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', marginTop: '24px' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
