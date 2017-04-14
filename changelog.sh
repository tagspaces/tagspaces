#!/bin/bash
git log v2.7.0..HEAD --no-merges --format=%B > CHANGELOG.TXT
