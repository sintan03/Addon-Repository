const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const fse = require("fs-extra");

//----------------------------------------
// arguments
//----------------------------------------

const PLAYER_NAME = process.argv[2];
const ADDON_NAME = process.argv[3];

if (!PLAYER_NAME || !ADDON_NAME) {
  console.log("Usage:");
  console.log(
    "node tools/build.js <Player> <Addon>"
  );

  process.exit(1);
}

//----------------------------------------
// paths
//----------------------------------------

const ROOT = path.resolve(__dirname, "..");

const PLAYER_ROOT = path.join(
  ROOT,
  "players",
  PLAYER_NAME
);

const SRC = path.join(
  PLAYER_ROOT,
  "src",
  ADDON_NAME
);

const BP = path.join(
  SRC,
  `${ADDON_NAME}_BP`
);

const RP = path.join(
  SRC,
  `${ADDON_NAME}_RP`
);

const RELEASES = path.join(
  PLAYER_ROOT,
  "releases"
);

const PACKAGE_DIR = path.join(
  RELEASES,
  "packages"
);

const SERVER_DIR = path.join(
  RELEASES,
  "server",
  ADDON_NAME
);

//----------------------------------------
// main
//----------------------------------------

async function main() {

  //----------------------------------------
  // check
  //----------------------------------------

  if (!fs.existsSync(BP)) {
    throw new Error(`BP not found: ${BP}`);
  }

  if (!fs.existsSync(RP)) {
    throw new Error(`RP not found: ${RP}`);
  }

  //----------------------------------------
  // prepare
  //----------------------------------------

  await fse.ensureDir(PACKAGE_DIR);

  //----------------------------------------
  // server copy
  //----------------------------------------

  await fse.remove(SERVER_DIR);

  await fse.copy(
    BP,
    path.join(
      SERVER_DIR,
      `${ADDON_NAME}_BP`
    )
  );

  await fse.copy(
    RP,
    path.join(
      SERVER_DIR,
      `${ADDON_NAME}_RP`
    )
  );

  console.log("Copied BP/RP");

  //----------------------------------------
  // mcaddon
  //----------------------------------------

  const mcaddonPath = path.join(
    PACKAGE_DIR,
    `${ADDON_NAME}.mcaddon`
  );

  if (fs.existsSync(mcaddonPath)) {
    fs.unlinkSync(mcaddonPath);
  }

  const output =
    fs.createWriteStream(mcaddonPath);

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(output);

  archive.directory(
    BP,
    `${ADDON_NAME}_BP`
  );

  archive.directory(
    RP,
    `${ADDON_NAME}_RP`
  );

  await archive.finalize();

  console.log(
    `Created ${ADDON_NAME}.mcaddon`
  );
}

main().catch(console.error);