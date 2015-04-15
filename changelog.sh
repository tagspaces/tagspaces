#!/bin/bash
git log v1.10.3..HEAD --no-merges --format=%B > CHANGELOG.TXT

