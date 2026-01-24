# Google Sheets Template Structure

This document shows exactly how to structure your Google Sheets for the NFL Draft Game.

## Overview

Your Google Sheet should have **5 sheets (tabs)**:
1. Submissions
2. Players
3. Draft Results
4. Scores
5. Settings

## Sheet 1: Submissions

**Purpose**: Stores all user submissions

**Headers Row 1**:
```
Name | Pick1_Player | Pick1_Position | Pick1_College | Pick2_Player | Pick2_Position | Pick2_College | ... (continue for all 32 picks) | TradeUp1 | TradeUp2 | TradeUp3 | TradeDown1 | TradeDown2 | TradeDown3 | Timestamp
```

**Simplified headers** (the app will handle this, just create these key columns):
```
Name | Timestamp
```
The app will automatically add all the pick columns when the first submission comes in.

**Example data** (auto-populated by app):
```
John Doe | Travis Hunter | CB | Colorado | ... | Titans | Giants | ... | Browns | Jets | ... | 2026-04-20T10:30:00Z
```

## Sheet 2: Players

**Purpose**: List of all draft-eligible players

**Headers Row 1**:
```
PlayerName | Position | College | Projected Round
```

**Example data**:
```
Travis Hunter | CB/WR | Colorado | 1
Shedeur Sanders | QB | Colorado | 1
Abdul Carter | EDGE | Penn State | 1
Tetairoa McMillan | WR | Arizona | 1
Will Johnson | CB | Michigan | 1
Cam Ward | QB | Miami | 1
Mason Graham | DT | Michigan | 1
Kelvin Banks Jr. | OT | Texas | 1
Will Campbell | OT | LSU | 1
Mykel Williams | EDGE | Georgia | 1
James Pearce Jr. | EDGE | Tennessee | 1
Tyler Warren | TE | Penn State | 1
Luther Burden III | WR | Missouri | 1
Emeka Egbuka | WR | Ohio State | 1
Jalon Walker | LB | Georgia | 1
Kenneth Grant | DT | Michigan | 1
Jihaad Campbell | LB | Alabama | 1
Malaki Starks | S | Georgia | 1
Ashton Jeanty | RB | Boise State | 1
Quinn Ewers | QB | Texas | 1
```

**Add more players as needed!** The more players you add, the better the autocomplete will work.

## Sheet 3: Draft Results

**Purpose**: Actual draft results (filled in by admin after the draft)

**Headers Row 1**:
```
Pick | Team | ActualPlayer
```

**Example data** (filled in on draft day):
```
1 | Tennessee Titans | Travis Hunter
2 | Cleveland Browns | Shedeur Sanders
3 | New York Giants | Abdul Carter
...
```

**Leave this empty until draft day!**

## Sheet 4: Scores

**Purpose**: Calculated scores (auto-populated by the app)

**Headers Row 1**:
```
Name | FirstRoundPoints | PickNumberPoints | TeamPoints | TradePoints | TotalScore | Timestamp
```

**Example data** (auto-calculated):
```
John Doe | 25 | 9 | 10 | 4 | 48 | 2026-04-20T10:30:00Z
Jane Smith | 28 | 6 | 15 | 2 | 51 | 2026-04-20T11:15:00Z
```

**Leave this empty** - the app will populate it when you calculate scores.

## Sheet 5: Settings

**Purpose**: Game configuration settings

**Headers Row 1**:
```
Key | Value
```

**Required data** (add this now):
```
submission_locked | false
deadline | 2026-04-24T00:00:00Z
```

**Notes**:
- `submission_locked`: Set to "true" to prevent new submissions
- `deadline`: Optional - ISO date format for submission deadline

## Quick Setup Checklist

- [ ] Create new Google Sheet
- [ ] Rename to "NFL Draft Game 2026"
- [ ] Create 5 sheets (tabs)
- [ ] Name them: Submissions, Players, Draft Results, Scores, Settings
- [ ] Add headers to each sheet (see above)
- [ ] Add player data to "Players" sheet (at least 20-30 prospects)
- [ ] Add settings to "Settings" sheet
- [ ] Share sheet with service account email (Editor access)
- [ ] Copy Sheet ID from URL

## Visual Layout

```
Tab 1: Submissions
┌─────────────┬──────────────┬───────────────┬──────┬───────────┐
│ Name        │ Pick1_Player │ Pick1_Position│ ...  │ Timestamp │
├─────────────┼──────────────┼───────────────┼──────┼───────────┤
│ (empty)     │              │               │      │           │
└─────────────┴──────────────┴───────────────┴──────┴───────────┘

Tab 2: Players
┌───────────────────┬──────────┬─────────────┬─────────────────┐
│ PlayerName        │ Position │ College     │ Projected Round │
├───────────────────┼──────────┼─────────────┼─────────────────┤
│ Travis Hunter     │ CB/WR    │ Colorado    │ 1               │
│ Shedeur Sanders   │ QB       │ Colorado    │ 1               │
│ ...               │ ...      │ ...         │ ...             │
└───────────────────┴──────────┴─────────────┴─────────────────┘

Tab 3: Draft Results
┌──────┬───────────────────┬──────────────────┐
│ Pick │ Team              │ ActualPlayer     │
├──────┼───────────────────┼──────────────────┤
│ (empty until draft day)                     │
└──────┴───────────────────┴──────────────────┘

Tab 4: Scores
┌──────────┬─────────────────┬─────────────────┬──────┬────────────┐
│ Name     │ FirstRoundPoints│ PickNumberPoints│ ...  │ TotalScore │
├──────────┼─────────────────┼─────────────────┼──────┼────────────┤
│ (empty until scores calculated)                                  │
└──────────┴─────────────────┴─────────────────┴──────┴────────────┘

Tab 5: Settings
┌───────────────────┬───────┐
│ Key               │ Value │
├───────────────────┼───────┤
│ submission_locked │ false │
│ deadline          │ ...   │
└───────────────────┴───────┘
```

## Tips

1. **Players Sheet**: Add as many prospects as possible. Include QBs, WRs, OL, DL, LBs, DBs, etc.
2. **Keep it updated**: Update the Players sheet as the draft season progresses
3. **Draft order**: The app uses hardcoded draft order - update it in the code if teams trade picks before the draft
4. **Backup**: Google Sheets auto-saves, but you can still make a copy as backup before the draft

## Sample Data

Want to test? Add these 30 players to get started:

```
Travis Hunter | CB/WR | Colorado | 1
Shedeur Sanders | QB | Colorado | 1
Abdul Carter | EDGE | Penn State | 1
Tetairoa McMillan | WR | Arizona | 1
Will Johnson | CB | Michigan | 1
Cam Ward | QB | Miami | 1
Mason Graham | DT | Michigan | 1
Kelvin Banks Jr. | OT | Texas | 1
Will Campbell | OT | LSU | 1
Mykel Williams | EDGE | Georgia | 1
James Pearce Jr. | EDGE | Tennessee | 1
Tyler Warren | TE | Penn State | 1
Luther Burden III | WR | Missouri | 1
Emeka Egbuka | WR | Ohio State | 1
Jalon Walker | LB | Georgia | 1
Kenneth Grant | DT | Michigan | 1
Jihaad Campbell | LB | Alabama | 1
Malaki Starks | S | Georgia | 1
Ashton Jeanty | RB | Boise State | 1
Quinn Ewers | QB | Texas | 1
Nic Scourton | EDGE | Texas A&M | 1
Shemar Stewart | DT | Texas A&M | 1
Shavon Revel | CB | East Carolina | 1
Tyler Booker | OG | Alabama | 1
Donovan Jackson | OG | Ohio State | 1
Trey Amos | CB | Ole Miss | 1
Benjamin Morrison | CB | Notre Dame | 1
Jahdae Barron | CB | Texas | 1
Princely Umanmielen | EDGE | Ole Miss | 1
Colston Loveland | TE | Michigan | 1
```
