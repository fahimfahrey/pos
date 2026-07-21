// This file intentionally violates design token lint rules for testing purposes.
// Do not copy patterns from this file into real components.

export function BadHexColor() {
  return <div style={{ color: '#ffffff', backgroundColor: '#000000' }}>Raw hex colors</div>
}

export function BadRgbColor() {
  return <div style={{ color: 'rgb(255, 0, 0)' }}>Raw RGB color</div>
}

export function BadHslColor() {
  return <div style={{ color: 'hsl(0, 100%, 50%)' }}>Raw HSL color</div>
}

export function BadSpacing() {
  return <div className="p-[13px] m-[7px] gap-[15px]">Off-scale spacing</div>
}

export function BadMixedSpacing() {
  return <div className="w-[123px] h-[456px] min-h-[789px]">More off-scale spacing</div>
}
