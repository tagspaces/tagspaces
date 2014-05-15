#!/bin/bash
git log v1.8.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

