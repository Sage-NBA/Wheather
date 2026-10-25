interface IconProps {
  className?: string;
  size?: number;
}

// 3D-styled glossy Sun matching the design
export function SunIcon({ className = "", size = 80 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Sun Sphere Gradient */}
        <radialGradient
          id="sunSphereGrad"
          cx="38%"
          cy="35%"
          r="65%"
          fx="35%"
          fy="30%"
        >
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="35%" stopColor="#FFAE00" />
          <stop offset="85%" stopColor="#F46E00" />
          <stop offset="100%" stopColor="#D95000" />
        </radialGradient>

        {/* Sun Ray Gradient */}
        <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEA79" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>

        {/* Ray shadow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF8C00" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 8 Glossy Rays */}
      <g filter="url(#glow)">
        <rect x="46.5" y="6" width="7" height="15" rx="3.5" fill="url(#rayGrad)" />
        <rect x="46.5" y="79" width="7" height="15" rx="3.5" fill="url(#rayGrad)" />
        <rect x="6" y="46.5" width="15" height="7" rx="3.5" fill="url(#rayGrad)" />
        <rect x="79" y="46.5" width="15" height="7" rx="3.5" fill="url(#rayGrad)" />

        <rect
          x="19"
          y="19"
          width="7"
          height="15"
          rx="3.5"
          fill="url(#rayGrad)"
          transform="rotate(-45 22.5 26.5)"
        />
        <rect
          x="74"
          y="74"
          width="7"
          height="15"
          rx="3.5"
          fill="url(#rayGrad)"
          transform="rotate(-45 77.5 81.5)"
        />
        <rect
          x="74"
          y="19"
          width="7"
          height="15"
          rx="3.5"
          fill="url(#rayGrad)"
          transform="rotate(45 77.5 26.5)"
        />
        <rect
          x="19"
          y="74"
          width="7"
          height="15"
          rx="3.5"
          fill="url(#rayGrad)"
          transform="rotate(45 22.5 81.5)"
        />
      </g>

      {/* Main 3D Sphere */}
      <circle cx="50" cy="50" r="26" fill="url(#sunSphereGrad)" filter="url(#glow)" />

      {/* Inner highlight for 3D glassy shine */}
      <ellipse cx="44" cy="40" rx="10" ry="6" fill="#FFFFFF" opacity="0.32" />
    </svg>
  );
}

// 3D-styled Cloud
export function CloudIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <filter id="cloudShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.4" />
        </filter>
      </defs>
      <path
        d="M19 44C15.134 44 12 40.866 12 37C12 33.393 14.733 30.424 18.239 30.046C18.082 29.382 18 28.697 18 28C18 21.373 23.373 16 30 16C35.534 16 40.17 19.748 41.569 24.847C42.477 24.309 43.535 24 44.667 24C48.165 24 51 26.835 51 30.333C51 30.648 50.977 30.957 50.932 31.258C53.305 32.553 55 35.088 55 38C55 42.418 51.418 46 47 46H19C17.895 46 17 45.105 17 44"
        fill="url(#cloudGrad)"
        filter="url(#cloudShadow)"
      />
    </svg>
  );
}

// 3D Sun Behind Cloud (Partly Cloudy)
export function PartlyCloudyIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="sunSmall" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="60%" stopColor="#FFAE00" />
          <stop offset="100%" stopColor="#F46E00" />
        </radialGradient>
        <linearGradient id="cloudPuff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <filter id="partlyShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Sun peaking behind */}
      <circle cx="40" cy="24" r="14" fill="url(#sunSmall)" />
      {/* Sun rays */}
      <rect x="38.5" y="4" width="3" height="6" rx="1.5" fill="#FFAE00" />
      <rect x="52" y="10" width="3" height="6" rx="1.5" fill="#FFAE00" transform="rotate(45 53.5 13)" />
      <rect x="56" y="22.5" width="6" height="3" rx="1.5" fill="#FFAE00" />

      {/* Cloud in front */}
      <path
        d="M17 48C13.686 48 11 45.314 11 42C11 38.909 13.342 36.363 16.347 36.04C16.213 35.47 16.143 34.883 16.143 34.286C16.143 28.605 20.748 24 26.429 24C31.173 24 35.148 27.213 36.348 31.583C37.126 31.122 38.033 30.857 39.003 30.857C42 30.857 44.429 33.286 44.429 36.286C44.429 36.556 44.409 36.821 44.37 37.079C46.404 38.188 47.857 40.362 47.857 42.857C47.857 46.649 44.791 49.714 41 49.714H17C16.05 49.714 15.28 48.944 15.28 48"
        fill="url(#cloudPuff)"
        filter="url(#partlyShadow)"
      />
    </svg>
  );
}

// 3D Rainy Cloud
export function RainIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="rainCloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <path
        d="M16 38C13.239 38 11 35.761 11 33C11 30.435 12.934 28.324 15.428 28.036C15.316 27.561 15.25 27.072 15.25 26.571C15.25 21.838 19.088 18 23.821 18C27.775 18 31.087 20.678 32.087 24.319C32.735 23.935 33.491 23.714 34.3 23.714C36.8 23.714 38.821 25.736 38.821 28.236C38.821 28.461 38.805 28.682 38.772 28.897C40.468 29.821 41.679 31.632 41.679 33.714C41.679 36.874 39.124 39.429 35.964 39.429H16"
        fill="url(#rainCloud)"
      />
      {/* Rain drops */}
      <line x1="20" y1="44" x2="17" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="44" x2="25" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="44" x2="33" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 3D Storm / Lightning
export function StormIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="stormCloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <path
        d="M16 34C13.239 34 11 31.761 11 29C11 26.435 12.934 24.324 15.428 24.036C15.316 23.561 15.25 23.072 15.25 22.571C15.25 17.838 19.088 14 23.821 14C27.775 14 31.087 16.678 32.087 20.319C32.735 19.935 33.491 19.714 34.3 19.714C36.8 19.714 38.821 21.736 38.821 24.236C38.821 24.461 38.805 24.682 38.772 24.897C40.468 25.821 41.679 27.632 41.679 29.714C41.679 32.874 39.124 35.429 35.964 35.429H16"
        fill="url(#stormCloud)"
      />
      {/* Lightning bolt */}
      <polygon
        points="27,33 21,43 27,43 24,53 34,40 28,40 31,33"
        fill="#FACC15"
      />
    </svg>
  );
}

// Master component to select the right icon based on WMO weather code or name
export function WeatherIcon({
  code,
  conditionName,
  size = 40,
  className = "",
}: {
  code?: number;
  conditionName?: string;
  size?: number;
  className?: string;
}) {
  const name = conditionName?.toLowerCase() || "";

  if (code === 0 || name.includes("sunny") || name.includes("clear")) {
    return <SunIcon size={size} className={className} />;
  }
  if (
    (code !== undefined && code >= 1 && code <= 3) ||
    name.includes("partly")
  ) {
    return <PartlyCloudyIcon size={size} className={className} />;
  }
  if (
    (code !== undefined && (code === 45 || code === 48)) ||
    name.includes("cloudy") ||
    name.includes("fog")
  ) {
    return <CloudIcon size={size} className={className} />;
  }
  if (
    (code !== undefined && code >= 51 && code <= 82) ||
    name.includes("rain") ||
    name.includes("drizzle") ||
    name.includes("shower")
  ) {
    return <RainIcon size={size} className={className} />;
  }
  if (
    (code !== undefined && code >= 95) ||
    name.includes("storm") ||
    name.includes("thunder")
  ) {
    return <StormIcon size={size} className={className} />;
  }

  // default fallback
  return <SunIcon size={size} className={className} />;
}
