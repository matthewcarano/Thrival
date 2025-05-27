import Head from 'next/head'
import ThrivalSystem from '@/components/thrival-system'

export default function Home() {
  return (
    <>
      <Head>
        <title>Thrival - AI Evaluation System</title>
        <meta name="description" content="AI-powered evaluation system for grant applications" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThrivalSystem />
    </>
  )
}
