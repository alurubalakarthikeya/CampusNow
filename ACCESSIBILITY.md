# Accessibility

CampusNow aims to be usable by as many students as possible, including people who use assistive technologies or have different accessibility needs. Accessibility is considered as the application develops, from interface design and navigation to readable content and interaction.

This document describes the accessibility practices we currently follow, expectations for contributors, and how accessibility barriers can be reported.

## Priorities

CampusNow prioritizes:

- Clear and readable text and interface elements.
- Sufficient visual distinction between important UI elements.
- Simple and predictable navigation.
- Touch targets that are practical to use.
- Meaningful labels for interactive elements.
- Support for platform accessibility features where practical.
- Avoiding unnecessary reliance on color alone to communicate information.
- Accessible and understandable content.

The current `v0.0.1` release is an early UI prototype. Accessibility support will continue to improve as functionality and screens are added.

We do not currently claim verified conformance with any specific accessibility standard.

## Contributor expectations

Contributors should consider accessibility when making changes to user-facing features.

When contributing UI changes:

- Use clear and readable text.
- Avoid communicating important information through color alone.
- Provide meaningful labels for interactive elements.
- Avoid unnecessarily small touch targets.
- Preserve logical navigation and interaction flows.
- Consider users who rely on screen readers or other platform accessibility features.
- Test accessibility-related changes on a physical device where practical.

For user-facing changes, contributors should include relevant screenshots or recordings in the pull request when they help demonstrate the change. Accessibility testing results should also be mentioned when accessibility is directly affected.

## Reporting accessibility issues

If you encounter an accessibility barrier while using CampusNow, please report it through the project's GitHub Issues or contact the project maintainer privately.

When reporting an issue, useful information includes:

- The task you were trying to complete.
- What you expected to happen.
- What actually happened.
- The affected screen or feature.
- Device and operating system.
- Relevant browser or application version, if applicable.
- Assistive technology being used, if applicable.

Screenshots or screen recordings are welcome but are not required.

You do not need to disclose a disability or medical information when reporting an accessibility issue.

### Severity

Maintainers may assign severity during issue triage based on how strongly the barrier affects the user's ability to use the application.

Examples:

- **Critical**: A user cannot access or complete an essential application function.
- **High**: A major feature is difficult or impossible to use with an accessibility feature or assistive technology.
- **Medium**: A significant part of a screen or workflow creates difficulty but an alternative path exists.
- **Low**: A minor usability or accessibility issue that does not prevent task completion.

Reporters do not need to determine the severity of an issue.

### How we respond

We will review accessibility reports as part of normal issue triage and work toward resolving confirmed barriers.

Where possible, maintainers may provide:

- An acknowledgement that the issue has been received.
- Additional questions when more information is needed.
- A workaround when one is available.
- Updates when work on the issue begins.
- An opportunity to verify the fix after the issue has been addressed.

Response and resolution times may vary depending on the severity of the issue and the project's development stage.

## Ownership and maintenance

Accessibility is maintained by the CampusNow project maintainers.

Maintainers are responsible for:

- Reviewing reported accessibility barriers.
- Considering accessibility during feature development.
- Encouraging accessible implementation practices.
- Updating this document as the project's accessibility practices evolve.

This document will be reviewed periodically as CampusNow's features, supported platforms, and development processes change.

If project ownership changes, responsibility for accessibility practices should transfer to the new maintainers.

## Supported environments

CampusNow is a React Native application built with Expo and primarily targets mobile devices.

Accessibility support depends partly on the accessibility features provided by the underlying operating system and device.

The project is currently focused on:

- Android mobile devices.
- iOS mobile devices as supported by the Expo/React Native application.
- Platform-provided accessibility features such as screen readers and text scaling where supported by the application.

The project is still in early development, and not all device, operating system, and assistive technology combinations have been formally evaluated.

## Known limitations

CampusNow `v0.0.1` is an early UI prototype and has not undergone a comprehensive accessibility evaluation.

Potential limitations may include:

- Some interactive elements may not yet have complete accessibility labels.
- Screen-reader navigation may not be fully optimized across all screens.
- Some UI elements may not yet respond ideally to larger text settings.
- Accessibility behavior may vary between Android and iOS.
- The current prototype has limited accessibility testing coverage.

These limitations will be addressed progressively as the application develops.

If you encounter a barrier that is not documented here, please report it through the project's accessibility issue process.

## Feedback and improvements

Accessibility feedback is welcome and helps improve CampusNow for everyone.

To suggest improvements to this accessibility statement or the project's accessibility practices, open a GitHub issue or contact the project maintainer.

For an active accessibility barrier, please use the reporting process described in [Reporting accessibility issues](#reporting-accessibility-issues).
