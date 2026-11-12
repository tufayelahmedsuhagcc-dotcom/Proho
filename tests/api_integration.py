"""Run against the same production server as the browser tests. Standard library only."""
import json,os,pathlib,urllib.request,urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1];BASE=os.getenv('PROHOR_URL','http://127.0.0.1:3000');results=[]
for method,path,status in [('GET','/api/feeds?feed=studies',200),('GET','/api/feeds?feed=space-weather',200),('GET','/api/feeds?feed=https://example.org',400),('POST','/api/feeds?feed=studies',405),('GET','/api/unknown',404)]:
 try:response=urllib.request.urlopen(urllib.request.Request(BASE+path,method=method),timeout=25)
 except urllib.error.HTTPError as e:response=e
 payload=json.loads(response.read());assert response.status==status,(path,response.status)
 if status==200:assert payload['status'] in ['live','cached'] and payload['retrievedAt'] and payload['data']
 results.append({'method':method,'path':path,'httpStatus':response.status,'status':payload.get('status'),'source':payload.get('sourceUrl'),'retrievedAt':payload.get('retrievedAt'),'contentType':response.headers.get('content-type')})
 print('PASS',method,path,response.status)
(ROOT/'docs/test-results/api-integration.json').write_text(json.dumps(results,indent=2))
