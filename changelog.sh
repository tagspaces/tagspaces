#!/bin/bash
git log v2.1.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

