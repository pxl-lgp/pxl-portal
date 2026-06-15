import { cn } from "@/lib/utils";

// Isometric pixel-block wordmark, rebuilt from the brand's "PIXEL" logo art:
// each letter is a grid of small 3D cubes extruded up-left, faces in the
// theme foreground color outlined with the background color so the blocky
// depth reads in both dark and light mode.

const LETTERS: Record<string, string[]> = {
  P: ["1111", "1..1", "1..1", "1111", "1...", "1..."],
  X: ["1...1", ".1.1.", "..1..", "..1..", ".1.1.", "1...1"],
  L: ["1...", "1...", "1...", "1...", "1...", "1111"],
};

const CELL = 10; // cube face size
const DEPTH = 4; // isometric extrusion (up-left)
const GAP = 2; // empty columns between letters

interface Cube {
  col: number;
  row: number;
}

function buildCubes(word: string): { cubes: Cube[]; cols: number; rows: number } {
  const cubes: Cube[] = [];
  let colOffset = 0;
  let rows = 0;
  for (const char of word) {
    const grid = LETTERS[char];
    if (!grid) continue;
    rows = Math.max(rows, grid.length);
    grid.forEach((line, row) => {
      [...line].forEach((cell, col) => {
        if (cell === "1") cubes.push({ col: colOffset + col, row });
      });
    });
    colOffset += grid[0].length + GAP;
  }
  // painter's algorithm: bottom-to-top, right-to-left, so cubes above and to
  // the left correctly cover their neighbors' extruded faces
  cubes.sort((a, b) => b.row - a.row || b.col - a.col);
  return { cubes, cols: colOffset - GAP, rows };
}

const WORD = buildCubes("PXL");

interface PxlLogoProps {
  className?: string;
  /** show the letterspaced "DIGITAL MARKETING" line under the wordmark */
  tagline?: boolean;
  taglineClassName?: string;
}

export function PxlLogo({ className, tagline = false, taglineClassName }: PxlLogoProps) {
  const width = WORD.cols * CELL + DEPTH + 3;
  const height = WORD.rows * CELL + DEPTH + 3;

  return (
    <span className="inline-flex flex-col">
      <svg
        viewBox={`${-DEPTH - 1.5} ${-DEPTH - 1.5} ${width} ${height}`}
        className={cn("h-8 w-auto", className)}
        role="img"
        aria-label="PXL"
      >
        {WORD.cubes.map(({ col, row }) => {
          const x = col * CELL;
          const y = row * CELL;
          return (
            <g
              key={`${col}-${row}`}
              fill="var(--foreground)"
              stroke="var(--background)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            >
              {/* top face */}
              <polygon
                points={`${x},${y} ${x + CELL},${y} ${x + CELL - DEPTH},${y - DEPTH} ${x - DEPTH},${y - DEPTH}`}
              />
              {/* left face */}
              <polygon
                points={`${x},${y} ${x - DEPTH},${y - DEPTH} ${x - DEPTH},${y + CELL - DEPTH} ${x},${y + CELL}`}
              />
              {/* front face */}
              <rect x={x} y={y} width={CELL} height={CELL} />
            </g>
          );
        })}
      </svg>
      {tagline && (
        <span
          className={cn(
            "mt-1.5 text-[0.6rem] font-semibold tracking-[0.42em] text-foreground",
            taglineClassName
          )}
        >
          DIGITAL MARKETING
        </span>
      )}
    </span>
  );
}
