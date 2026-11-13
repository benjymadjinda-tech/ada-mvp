import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-ada-blue flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-ada-blue">Ada</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-ada-blue"
          >
            Tarifs
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-ada-blue"
          >
            Connexion
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 bg-ada-blue text-white rounded-xl font-medium hover:opacity-90 transition text-sm"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-ada-blue leading-tight mb-6">
          Apprends à ton rythme.
          <br />
          <span className="text-ada-violet">Avance avec les autres.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Ada combine une IA d’apprentissage ultra-adaptative et une entraide
          humaine intelligente. Tu progresses plus vite, sans jamais rester
          bloqué seul.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-8 py-4 bg-ada-blue text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition shadow-lg"
        >
          Créer mon compte gratuit
        </Link>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-ada-blue mb-12">
            Comment ça marche
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Diagnostic intelligent",
                desc: "Tu indiques tes matières, ton niveau scolaire et ton objectif. L’IA s’adapte précisément."
              },
              {
                num: "2",
                title: "Parcours + Tuteur IA",
                desc: "Un parcours personnalisé + un tuteur IA qui t’aide par indices (sans spoiler les réponses)."
              },
              {
                num: "3",
                title: "Entraide humaine",
                desc: "Dès que tu bloques vraiment, tu es mis en relation avec quelqu’un qui a déjà surmonté le même obstacle."
              }
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-ada-blue text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ada-blue py-14 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Prêt à apprendre autrement ?
        </h2>
        <Link
          href="/auth/signup"
          className="inline-block mt-4 px-8 py-3.5 bg-white text-ada-blue rounded-2xl font-semibold text-lg hover:bg-gray-100 transition"
        >
          Commencer maintenant
        </Link>
      </section>
    </div>
  );
}
