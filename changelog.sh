#!/bin/bash
git log 1.9.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

