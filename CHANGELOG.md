# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.3.1] - 2023-05-31

New image-tag: `v4.3.1` with digest `sha256:ce38940602970fcc41a14ffb05eb5e3ce424cef348a10d39ceb3aa15b101254e`

### Fixed

- Fixed a bug that prevented windows users from using the CSV import (896ab99fd458afd18e660660f96a071ed5d1e053)

## [4.3.0] - 2023-05-31

New image-tag: `v4.3.0` with digest `sha256:07863207205d1e237b90e5ba8b99ad5b02a27e3d711eb4dea3eec0acb0c63361`

### Added

- The CSV import has now a progress shown to the user
- Implemented server-sent events 

### Changed 

- Moved to new `ScanService` in order to centralize the scan logic and database actions

### Fixed 

- Fixed a bug causing missing scan details in overview after csv import (reuse of the same messageId)
- Fixed several accessibility issues
- Added an empty string as default if no check description is present

## [4.2.3] - 2023-05-25

New image-tag: `v4.2.3` with digest `sha256:43dc507787ade235b16def0c15e95072ceb3f3050fe611392ace0091b3ac0c9b`

### Fixed

- Caching behaviour was improved. In case of refresh, caches in the scanner will be bypassed

## [4.2.2] - 2023-05-19

New image-tag: `v4.2.2` with digest `sha256:3046d1aa370e6a5835e1e079d6a8359866e4c115ba0e281257047924d8ddc7ec`

### Fixed

- Users can be deleted right after adding them (#106)
- Scan button border fix (#115)
- Removed role, first name and last name from users
- added image into sidenav for mobile devices


## [4.2.1] - 2023-05-17

New image-tag: `v4.2.1` with digest `sha256:efee957e35aefe543e2dd934e4f91476d133f9a21055cc8e3728212bba30bbf3`

### Fixed

- Fixed a bug causing an error when using the QA/ test query parameters `forceCollection` and `displayDiff`. (#112)

## [4.2.0] - 2023-05-16

New image-tag: `v4.2.0` with digest `sha256:4a842290b98d7c50a6af902fec88c2c6e903f5aa07fef5c4080fcc33675ccfff`

### Added

- **Versioning for API Endpoints. The introduced Version is `/api/v1`. (031d3cf5)**
- Additional contact information on the info page (#84).
- Bundesadler to mobile menu (#97).
- Added a loading spinner, status info and automatic update for users when statistics generation is not yet complete. This makes it easier to understand why no or only parts of the graphs or pie charts are displayed. (2059da27 and b251dc9a)



### Fixed

- Fixed a bug on the domain overview where if you looked at a high page (pagination) of domains and filtered, you didn't get any results because the page wasn't updated (#95).
- Styling of the empty state modal (#94).
- Fixed that the empty state modal was still displayed after adding a domain (#93).
- Fixed that the domain-search was case sensitive (#89).
- Fixed error handling and display when an invalid/ non existing domain is added (#101).
- Fixed a styling issue with the result icons (#103).
- Fixed a bug where the domain count after adding a domain is not updated properly (#105).
- Fixed a bug where a deleted domain was still displayed in the domain overview when filter were aplied (#107).
- Fixed serveral styling issues.
- Fixed a bug in the domain search. 
- Fixed a bug in the login flow. 
- Fixed signout in the header component.
- Fixed the side navigation.
- Fixed serveral issues in the mobile view.

### Changed

- The API now only returns the current officially tested check results. ([031d3cf5](https://gitlab.com/ozg-security/ozgsec-security-quick-test/-/commit/031d3cf5850e3039530b133ccb8ac4012e56bdc0))
- Upgrade dependencies (especially `next`to `13.4.2`).
- Following the dependency upgrade from next and others, many restructuring were carried out, and the new schema specified by next was implemented.
