#!/bin/bash
git log v2.3.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

