export const DEFAULT_FACE_ID = "superman-classic";

export const FACE_DEFINITIONS = {
  "superman-classic": {
    id: "superman-classic",
    label: "Superman Classic",
    backgroundImage: "superman-bg.png",
    colors: {
      time: "#cfe4ff",
      text: "#FFFFFF"
    },
    typography: {
      timeSize: 100,
      dateSize: 24,
      weatherSize: 22
    },
    layout: {
      hours: { x: "60%", y: "58%" },
      minutes: { x: "60%", y: "88%" },
      date: { x: "12%", y: "15%" },
      weather: { x: "22%", y: "25%" },
      weatherIcon: { x: "12%", y: "19%", width: 24, height: 24 }
    },
    features: {
      showDate: true,
      showWeather: true,
      showActivity: true
    }
  },
  "superman-minimal": {
    id: "superman-minimal",
    label: "Superman Minimal",
    backgroundImage: "superman-bg.png",
    colors: {
      time: "#FFFFFF",
      text: "#FFFFFF"
    },
    typography: {
      timeSize: 106,
      dateSize: 20,
      weatherSize: 20
    },
    layout: {
      hours: { x: "60%", y: "60%" },
      minutes: { x: "60%", y: "92%" },
      date: { x: "12%", y: "14%" },
      weather: { x: "22%", y: "24%" },
      weatherIcon: { x: "12%", y: "18%", width: 24, height: 24 }
    },
    features: {
      showDate: true,
      showWeather: false,
      showActivity: false
    }
  }
};

export function resolveFaceConfig(faceId) {
  if (faceId && FACE_DEFINITIONS[faceId]) {
    return FACE_DEFINITIONS[faceId];
  }
  return FACE_DEFINITIONS[DEFAULT_FACE_ID];
}

export function listFaceOptions() {
  return Object.keys(FACE_DEFINITIONS).map((id) => ({
    id,
    label: FACE_DEFINITIONS[id].label
  }));
}
