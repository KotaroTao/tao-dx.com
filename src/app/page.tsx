export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        T.A.O Marketing System
      </h1>

      <p style={{
        fontSize: '1.5rem',
        opacity: 0.9,
        marginBottom: '3rem',
      }}>
        Think / Act / Optimize
      </p>

      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Card
          title="Think"
          subtitle="考える"
          description="データに基づいた戦略立案"
        />
        <Card
          title="Act"
          subtitle="動く"
          description="効率的な実行と自動化"
        />
        <Card
          title="Optimize"
          subtitle="改善する"
          description="継続的な改善サイクル"
        />
      </div>

      <p style={{
        marginTop: '4rem',
        opacity: 0.6,
        fontSize: '0.9rem',
      }}>
        by 田尾耕太郎
      </p>
    </main>
  )
}

function Card({ title, subtitle, description }: {
  title: string
  subtitle: string
  description: string
}) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      padding: '2rem',
      width: '250px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
      <h2 style={{
        fontSize: '2rem',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '1.2rem',
        opacity: 0.8,
        marginBottom: '1rem',
      }}>
        {subtitle}
      </p>
      <p style={{ opacity: 0.7 }}>
        {description}
      </p>
    </div>
  )
}
