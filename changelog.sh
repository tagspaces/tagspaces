#!/bin/bash
git log v1.11.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

