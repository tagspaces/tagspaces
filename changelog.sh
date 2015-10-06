#!/bin/bash
git log v1.12.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

