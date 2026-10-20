# Security policy

## Reporting a vulnerability

Email **daniel.oceno@gmail.com* with a description, the affected tag and, if you have one, a minimal reproduction. Please do not open a public issue for a vulnerability.

We aim to acknowledge a report within a few working days and will tell you what we decide. There is no bug bounty.

## Supported versions

The latest minor release only. Fixes ship as a new tag; upgrade by bumping the tag in your install (`npm i github:danieloceno/lumux#vX.Y.Z`).

## Scope

lumux is a set of CSS tokens, a theme runtime and React components, plus scripts that consumers run in their own repositories. Reports about those are in scope. Vulnerabilities in dependencies belong to the upstream project; tell us if lumux pins a version that is affected.
