import { Html, Head, Body, Container, Heading, Text, Hr } from '@react-email/components';

interface SubmissionReceivedEmailProps {
  studentName: string;
  projectName: string;
  submittedAt: string;
}

export default function SubmissionReceivedEmail({ studentName, projectName, submittedAt }: SubmissionReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Submission Received</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>Your submission for <strong>{projectName}</strong> has been received on {new Date(submittedAt).toLocaleDateString()}.</Text>
          <Text style={text}>Our reviewers will evaluate your work and provide feedback within 5-7 business days.</Text>
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
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
