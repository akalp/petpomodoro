//
//  LiveActivityWidgetLiveActivity.swift
//  LiveActivityWidget
//
//  Created by Hasan Akalp on 30.05.2026.
//

import ActivityKit
import WidgetKit
import SwiftUI

private let liveActivityTint = Color(red: 1.0, green: 0.125, blue: 0.339)

private enum FocusPhase: String {
    case running
    case awaitingConfirmation = "awaiting_confirmation"
    case completed
    case abandoned
}

private func parseDate(_ value: String) -> Date {
    let fractionalFormatter = ISO8601DateFormatter()
    fractionalFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = fractionalFormatter.date(from: value) {
        return date
    }

    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime]
    return formatter.date(from: value) ?? Date()
}

private func storedPhase(context: GenericAttributes.ContentState) -> FocusPhase {
    if let phase = FocusPhase(rawValue: context.values["phase"] ?? "") {
        return phase
    }

    switch context.values["status"] {
    case "Completed": return .completed
    case "Abandoned": return .abandoned
    case "Time's up!": return .awaitingConfirmation
    default: return .running
    }
}

private func displayPhase(context: GenericAttributes.ContentState) -> FocusPhase {
    let phase = storedPhase(context: context)
    if phase == .running && Date() >= parseDate(context.values["expectedEndAt"] ?? "") {
        return .awaitingConfirmation
    }

    return phase
}

private func primaryText(for phase: FocusPhase, values: [String: String]) -> String {
    switch phase {
    case .running: return values["title"] ?? "Focus time"
    case .awaitingConfirmation: return values["title"] ?? "Time's up"
    case .completed: return values["title"] ?? "Session complete"
    case .abandoned: return values["title"] ?? "Session ended"
    }
}

private func supportingText(for phase: FocusPhase, values: [String: String]) -> String {
    switch phase {
    case .running: return values["support"] ?? "Come back to confirm when time is up"
    case .awaitingConfirmation: return values["support"] ?? "Come back to confirm"
    case .completed: return values["support"] ?? "Your pet noticed"
    case .abandoned: return values["support"] ?? "No scolding"
    }
}

private func compactText(for phase: FocusPhase, values: [String: String]) -> String {
    switch phase {
    case .running: return values["compact"] ?? "Focus"
    case .awaitingConfirmation: return values["compact"] ?? "Confirm"
    case .completed: return values["compact"] ?? "Done"
    case .abandoned: return values["compact"] ?? "Ended"
    }
}

struct LiveActivityWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GenericAttributes.self) { context in
            // Lock Screen / Banner
            let phase = displayPhase(context: context.state)
            let startedAt = parseDate(context.state.values["startedAt"] ?? "")
            let expectedEndAt = parseDate(context.state.values["expectedEndAt"] ?? "")

            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    Image(systemName: "pawprint.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(.white)
                    Text(context.state.values["title"] ?? "Focus Session")
                        .font(.headline)
                        .foregroundStyle(.white)
                }
                if phase == .running {
                    Text(timerInterval: startedAt...expectedEndAt, countsDown: true)
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                } else {
                    Text(primaryText(for: phase, values: context.state.values))
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                }
                Text(supportingText(for: phase, values: context.state.values))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
                    .lineLimit(1)
            }
            .padding()
            .activityBackgroundTint(liveActivityTint)
            .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context -> DynamicIsland in
            // Dynamic Island
            let phase = displayPhase(context: context.state)
            let startedAt = parseDate(context.state.values["startedAt"] ?? "")
            let expectedEndAt = parseDate(context.state.values["expectedEndAt"] ?? "")

            return DynamicIsland {
                // Expanded
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "pawprint.fill")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.values["petEmoji"] ?? "🐾")
                        .font(.system(size: 18))
                        .lineLimit(1)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .center, spacing: 4) {
                        Text(phase == .running ? (context.state.values["title"] ?? "Focus time") : compactText(for: phase, values: context.state.values))
                            .font(.system(size: 12, weight: .semibold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.82))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                        if phase == .running {
                            Text(timerInterval: startedAt...expectedEndAt, countsDown: true)
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                                .monospacedDigit()
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                        } else {
                            Text(primaryText(for: phase, values: context.state.values))
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                        }
                        Text(supportingText(for: phase, values: context.state.values))
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.8))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                }
            } compactLeading: {
                // Compact - left side
                Image(systemName: "pawprint.fill")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
            } compactTrailing: {
                // Compact - right side
                if phase == .running {
                    Text(timerInterval: startedAt...expectedEndAt, countsDown: true)
                        .font(.system(size: 11, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                        .frame(width: 44, alignment: .trailing)
                } else if phase == .completed {
                    Text("✓")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                } else {
                    Text(compactText(for: phase, values: context.state.values))
                        .font(.system(size: 10, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                        .frame(width: 46, alignment: .trailing)
                }
            } minimal: {
                // Minimal - just the icon
                Image(systemName: "pawprint.fill")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .keylineTint(liveActivityTint)
        }
    }
}
