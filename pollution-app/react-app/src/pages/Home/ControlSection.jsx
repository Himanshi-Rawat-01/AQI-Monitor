import useScrollReveal from '../../hooks/useScrollReveal'

const INDIVIDUAL_TIPS = [
  'Use public transport, carpool, or cycle when possible.',
  'Avoid outdoor workouts during peak traffic hours.',
  'Keep indoor air clean with ventilation and filtration.',
  'Track local AQI before planning school, work, or travel.',
]

const COMMUNITY_TIPS = [
  'Strengthen emission surveillance and penalize violating industries.',
  'Scale clean energy adoption and dust-control measures.',
  'Increase urban green cover and monitor pollution hotspots.',
  'Use open air-quality data for transparent governance.',
]

export default function ControlSection() {
  const sectionRef = useScrollReveal({ threshold: 0.1 })

  return (
    <section className="control-section" id="control" ref={sectionRef}>
      <div className="section-shell section-shell-plain">
        <h2 className="section-title">Control AQI</h2>
        <p className="section-intro">Actions you and your community can take today to improve air quality.</p>
      </div>

      <div className="control-layout">
        <div className="control-panel">
          <h3>Individual Actions</h3>
          <ol className="control-list">
            {INDIVIDUAL_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
        <div className="control-panel">
          <h3>Community & Policy</h3>
          <ol className="control-list">
            {COMMUNITY_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
