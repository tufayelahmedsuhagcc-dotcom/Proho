"""Reproduce OSD-575 normalization from verified bytes; no editing or imputation."""
import csv, json, pathlib, hashlib, math
ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'public/data'
source = DATA / 'osd575-submitted.csv'
manifest = json.loads((DATA / 'source-manifest.json').read_text())
expected = next(x['sha256'] for x in manifest if x['file'] == source.name)
actual = hashlib.sha256(source.read_bytes()).hexdigest()
if actual != expected:
    raise ValueError('Source checksum mismatch. Review the original source, not just the expected hash.')

def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (ValueError, TypeError):
        return None

rows = []
with source.open(encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    required = {'ANALYTE', 'VALUE', 'RANGE_MIN', 'RANGE_MAX', 'UNITS', 'SUBJECT_ID', 'timepoint'}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError('Unexpected source CSV schema.')
    for i, r in enumerate(reader, 2):
        rows.append({'analyte': r['ANALYTE'], 'value': number(r['VALUE']), 'rawValue': r['VALUE'],
                     'min': number(r['RANGE_MIN']), 'max': number(r['RANGE_MAX']), 'unit': r['UNITS'],
                     'subject': r['SUBJECT_ID'], 'timepoint': r['timepoint'], 'sourceRow': i})
result = {'accession': 'OSD-575', 'rows': rows,
          'notice': 'Historical research, not personal telemetry. No missing values are imputed; non-numeric values stay null. Laboratory intervals are source metadata, not diagnostic advice.'}
(DATA / 'osd575.json').write_text(json.dumps(result, indent=2, allow_nan=False))
print('Normalized', len(rows), 'source rows. SHA-256', actual)
