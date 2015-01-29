#!/bin/bash
git log v1.10.0..HEAD --no-merges --format=%B > CHANGELOG.TXT

