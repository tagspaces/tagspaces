#!/bin/bash
git log v2.0.1..HEAD --no-merges --format=%B > CHANGELOG.TXT

