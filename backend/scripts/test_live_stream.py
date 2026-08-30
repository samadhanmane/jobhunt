import urllib.request
import urllib.parse
import json
import time

def test_stream():
    data = urllib.parse.urlencode({'role': 'AI Engineer', 'location': 'Worldwide'}).encode('utf-8')
    req = urllib.request.Request('https://jobhunt-zmq8.onrender.com/api/v1/search', data=data)

    print("1. Triggering initial search...")
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=120) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        search_id = res.get('search_id')
        print(f"Initial result returned in {time.time()-t0:.1f}s:")
        print("  Search ID:", search_id)
        print("  Status:", res.get("status"))
        print("  Total Found:", res.get("total_found"))
        print("  Unique Count:", res.get("unique_count"))
        print("  Raw Jobs:", len(res.get("raw_jobs", [])))

    print("\n2. Polling session stream over time...")
    for i in range(1, 10):
        time.sleep(3)
        poll_req = urllib.request.Request(f"https://jobhunt-zmq8.onrender.com/api/v1/jobs/{search_id}")
        try:
            with urllib.request.urlopen(poll_req, timeout=15) as poll_resp:
                poll_data = json.loads(poll_resp.read().decode('utf-8'))
                st = poll_data.get("status")
                raw_c = len(poll_data.get("raw_jobs", []))
                uniq_c = len(poll_data.get("unique_jobs", []))
                cur_c = len(poll_data.get("jobs", []))
                print(f"Poll #{i} (+{i*3}s): status={st} | raw_jobs={raw_c} | unique_jobs={uniq_c} | curated={cur_c}")
                if st == "completed":
                    print("Stream completed.")
                    break
        except Exception as e:
            print(f"Poll #{i} error:", e)

if __name__ == "__main__":
    test_stream()
