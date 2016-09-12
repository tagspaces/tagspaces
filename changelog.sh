#!/bin/bash
git log v2.4.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

