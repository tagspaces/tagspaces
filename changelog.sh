#!/bin/bash
git log v1.7.9..HEAD --no-merges --format=%B > CHANGELOG.TXT

