#!/bin/bash
git log v2.6.1..HEAD --no-merges --format=%B > CHANGELOG.TXT

