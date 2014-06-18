#!/bin/bash
git log v1.8.1..HEAD --no-merges --format=%B > CHANGELOG.TXT

