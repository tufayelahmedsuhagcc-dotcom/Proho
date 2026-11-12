"""Package the entire editable app, built web app and review documentation.

Run from anywhere: python scripts/package.py
Writes a ZIP and its SHA-256 beside the project directory.
Installed dependencies, credentials, caches and intermediate compiler state are excluded.
"""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT.parent / 'PROHOR-3.0-White-Theme-Full-Project.zip'
MANIFEST = ROOT / 'PROJECT-MANIFEST.json'
SKIP_DIRS = {'.git', '.arena', '.cache', '.venv', '__pycache__', 'node_modules', '.vite', '.playwright-cli'}
SKIP_NAMES = {'.env', '.git-credentials', '.netrc', 'PROJECT-MANIFEST.json'}


def included(path):
    relative = path.relative_to(ROOT)
    return (path.is_file() and not any(part in SKIP_DIRS for part in relative.parts)
            and path.name not in SKIP_NAMES and not path.name.endswith(('.tsbuildinfo', '.zip', '.pyc'))
            and not (path.name.startswith('.env.') and path.name != '.env.example'))


files = sorted(path for path in ROOT.rglob('*') if included(path))
required = ['package.json', 'package-lock.json', 'README.md', 'src/App.tsx',
            'server/start.mjs', 'server/feeds.mjs', 'web/index.html', 'web/sw.js',
            'docs/TEST-REPORT.md', 'public/data/osd575-submitted.csv']
for name in required:
    if ROOT / name not in files:
        raise ValueError(f'Required delivery file missing: {name}')
entries = [{'path': str(path.relative_to(ROOT)), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()} for path in files]
manifest = {'project': 'PROHOR', 'version': '3.0.0', 'releaseDate': '2026-11-11',
            'theme': 'white', 'edition': 'White-theme web-app revision',
            'scope': 'Complete editable white-theme web application, production build, data, tests and review documentation.',
            'fileCountExcludingThisManifest': len(entries),
            'uncompressedBytesExcludingThisManifest': sum(e['bytes'] for e in entries), 'files': entries}
MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
with zipfile.ZipFile(DEST, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in files + [MANIFEST]:
        archive.write(path, 'prohor/' + str(path.relative_to(ROOT)))
with zipfile.ZipFile(DEST) as archive:
    if archive.testzip() is not None:
        raise ValueError('Archive CRC verification failed.')
    for entry in entries:
        content = archive.read('prohor/' + entry['path'])
        if len(content) != entry['bytes'] or hashlib.sha256(content).hexdigest() != entry['sha256']:
            raise ValueError(f'Packaged bytes changed: {entry["path"]}')
    if len(archive.namelist()) != len(entries) + 1:
        raise ValueError('Unexpected archive file count.')
sha = hashlib.sha256(DEST.read_bytes()).hexdigest()
DEST.with_suffix('.sha256').write_text(f'{sha}  {DEST.name}\n')
print(json.dumps({'archive': str(DEST), 'files': len(entries) + 1,
                  'bytes': DEST.stat().st_size, 'sha256': sha,
                  'crcVerified': True, 'allFileHashesVerified': True}, indent=2))
