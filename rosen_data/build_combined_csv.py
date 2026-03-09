import os
import csv

data_dir = "/home/runner/workspace/rosen_data"

conditions = ['NL', '06hr', '09hr', '15hr', '18hr', '21hr', '24hr']
reporters = ['TF', 'bcat']

all_series = {}
for reporter in reporters:
    for cond in conditions:
        fname = f"{reporter}_{cond}.csv"
        fpath = os.path.join(data_dir, fname)
        with open(fpath) as f:
            vals = [float(line.strip()) for line in f if line.strip()]
        label = f"{reporter}_{cond}"
        all_series[label] = vals

n_points = len(next(iter(all_series.values())))
print(f"Timepoints: {n_points}")
print(f"Channels: {len(all_series)}")

# Build CSV: timestamp, channel1, channel2, ...
# Imaging was every 10 minutes based on the paper
header = ['timestamp'] + list(all_series.keys())
out_path = os.path.join(data_dir, "Rosen2026_Wnt_AntiResonance_AllConditions.csv")
with open(out_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for i in range(n_points):
        t_minutes = i * 10  # 10 min imaging intervals
        row = [t_minutes] + [all_series[ch][i] for ch in all_series]
        writer.writerow(row)

print(f"Wrote combined CSV to {out_path}")
print(f"Header: {header}")

# Also build per-condition CSVs with both reporters as columns (for targeted analysis)
for cond in conditions:
    out_cond = os.path.join(data_dir, f"Rosen2026_{cond}.csv")
    with open(out_cond, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', f'TopFlash_{cond}', f'BetaCatenin_{cond}'])
        tf_vals = all_series[f'TF_{cond}']
        bc_vals = all_series[f'bcat_{cond}']
        for i in range(n_points):
            writer.writerow([i * 10, tf_vals[i], bc_vals[i]])
    print(f"Wrote {out_cond}")

