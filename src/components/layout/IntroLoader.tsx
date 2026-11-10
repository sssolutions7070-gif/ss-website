/**
 * First-visit intro: two extruded 3D "S" letters flip in, a progress line
 * fills, then the panel lifts away. Pure CSS (works before JS loads), plays
 * once per browser session (see INTRO_SCRIPT), skipped for reduced motion.
 */
export const INTRO_SCRIPT = `(function(){try{if(sessionStorage.getItem('ss-intro')){document.documentElement.classList.add('intro-seen');}else{sessionStorage.setItem('ss-intro','1');}}catch(e){document.documentElement.classList.add('intro-seen');}})();`;

export function IntroLoader() {
  return (
    <div className="intro-loader" aria-hidden>
      {/* #22 the SS mark is drawn as a line, then fills with colour */}
      <svg className="intro-svg" viewBox="0 0 320 160">
        <defs>
          <linearGradient id="intro-g" x1="0" x2="1">
            <stop offset="0" stopColor="#6a46ff" />
            <stop offset="1" stopColor="#c026d3" />
          </linearGradient>
        </defs>
        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" className="intro-draw">
          SS
        </text>
      </svg>
      <div className="intro-bar">
        <span />
      </div>
      <p className="intro-caption">
        SS Solutions <span className="intro-count" />
      </p>
    </div>
  );
}
