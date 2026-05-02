import pandas as pd
from typing import Optional


def calculate_avg_transit_time(checkpoints_df: pd.DataFrame) -> Optional[float]:
    """
    Calculate the average transit time between the first and last checkpoint
    for each product, then return the overall average in hours.

    Parameters
    ----------
    checkpoints_df : pd.DataFrame
        DataFrame containing checkpoint records with at least
        'product_id' and 'timestamp' columns.

    Returns
    -------
    float or None
        Average transit time in hours, or None if insufficient data.
    """
    # TODO: Group by product_id, compute min/max timestamp delta, return mean in hours
    return None


def detect_anomalies(df: pd.DataFrame, z_threshold: float = 2.0) -> pd.DataFrame:
    """
    Detect anomalous transit times using Z-score analysis.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with a numeric column to analyze (e.g., transit time).
    z_threshold : float
        Number of standard deviations from the mean to flag as anomalous.

    Returns
    -------
    pd.DataFrame
        Subset of rows where the Z-score exceeds the threshold.
    """
    # TODO: Compute Z-scores for the target column and filter outliers
    return pd.DataFrame()


def calculate_on_time_rate(
    checkpoints_df: pd.DataFrame, expected_durations: pd.DataFrame
) -> Optional[float]:
    """
    Calculate the percentage of shipments delivered within the expected duration.

    Parameters
    ----------
    checkpoints_df : pd.DataFrame
        DataFrame with checkpoint timestamps per product.
    expected_durations : pd.DataFrame
        DataFrame mapping product_id to expected transit duration in hours.

    Returns
    -------
    float or None
        On-time delivery rate as a percentage (0-100), or None if insufficient data.
    """
    # TODO: Merge datasets, compare actual vs expected duration, compute rate
    return None
