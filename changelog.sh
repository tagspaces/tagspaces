#!/bin/bash
git log v1.8.5..HEAD --no-merges --format=%B > CHANGELOG.TXT

