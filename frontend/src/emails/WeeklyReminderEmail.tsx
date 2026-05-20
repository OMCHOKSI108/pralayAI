import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components';

interface WeeklyReminderEmailProps {
  studentName: string;
  projectName: string;
  milestonesCompleted: number;
  totalMilestones: number;
  daysRemaining: number;
}

export default function WeeklyReminderEmail({ studentName, projectName, milestonesCompleted, totalMilestones, daysRemaining }: WeeklyReminderEmailProps) {
  const progress = totalMilestones > 0 ? Math.round((milestonesCompleted / totalMilestones) * 100) : 0;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Weekly Progress Check</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>Here is your progress summary for <strong>{projectName}</strong>:</Text>
          <Section style={progressBox}>
            <Text style={progressText}><strong>Progress:</strong> {milestonesCompleted}/{totalMilestones} milestones ({progress}%)</Text>
            <Text style={progressText}><strong>Days remaining:</strong> {daysRemaining}</Text>
          </Section>
          <Text style={text}>Keep pushing forward. Every milestone brings you closer to your certificate!</Text>
          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={button}>Continue Building</Button>
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
const progressBox = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const progressText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const button = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', marginTop: '24px' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
