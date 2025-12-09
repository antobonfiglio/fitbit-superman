const colourSet = [
  { color: "#FF0000" },     // red
  { color: "#F83C40" },
  { color: "#DC143C" },     // crimson
  { color: "#FF1493" },     // deeppink
  { color: "#FFC0CB" },     // pink
  { color: "#FF4500" },     // orangered
  { color: "#FFA500" },     // orange
  { color: "#FFCC33" },
  { color: "#FFFF00" },     // yellow
  { color: "#B8FC68" },
  { color: "#006400" },     // darkgreen
  { color: "#2E8B57" },     // seagreen
  { color: "#6B8E23" },     // olivedrab
  { color: "#90EE90" },     // lightgreen
  { color: "#008080" },     // teal
  { color: "#87CEFA" },     // lightskyblue
  { color: "#00BFFF" },     // deepskyblue
  { color: "#1E90FF" },     // dodgerblue
  { color: "#000080" },     // navy
  { color: "#9370DB" },     // mediumpurple
  { color: "#800080" },     // purple
  { color: "#D3D3D3" },     // lightgrey
  { color: "#808080" },     // grey
  { color: "#FFFFFF" }      // white
];

function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">Background Color</Text>}>
        <ColorSelect
          settingsKey="accentcolor"
          colors={colourSet}
        />
      </Section>
      <Section title={<Text bold align="center">Main Color</Text>}>
        <ColorSelect
          settingsKey="markercolor"
          colors={colourSet}
        />
      </Section>
      <Section title={<Text bold align="center">Time Color</Text>}>
        <ColorSelect
          settingsKey="timecolor"
          colors={colourSet}
        />
      </Section>
      <Section title={<Text bold align="center">Text Color</Text>}>
        <ColorSelect
          settingsKey="textcolor"
          colors={colourSet}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);