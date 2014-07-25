#!/bin/bash
git log v1.8.3..HEAD --no-merges --format=%B > CHANGELOG.TXT

