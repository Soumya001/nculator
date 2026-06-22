#!/bin/bash
set -e
echo "=== EAS Auth Check ==="
eas whoami
echo "Project ID in app.json:"
python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['extra']['eas']['projectId'])"
echo "=== Ready to build ==="
