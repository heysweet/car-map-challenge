"""
lightweight script for converting the json files
into pickup and dropoff coordinates
"""

import csv
import os
from itertools import izip

def pairwise(iterable):
  """Grabs elements in an iterable pairwise, discarding any unmatched items"""
  a = iter(iterable)
  return izip(a, a)

def convertCSVFiles(inputDirectory, outputDirectory):
  """Performs the conversion process to generate pickup/dropoff points"""

  # Process the csv files
  for filename in os.listdir(inputDirectory):
    csvInput = open(os.path.join(inputDirectory, filename), 'rb')
    f = csv.reader(csvInput)

    # Grab the fieldnames and move forward to the data
    fieldnames = next(f)

    csvOut = open(os.path.join(outputDirectory, filename), 'wb')
    writer = csv.writer(csvOut, quoting=csv.QUOTE_NONE)
    
    writer.writerow([
      'Date/Time',
      'Lat',
      'Lon',
      'DropoffLat',
      'DropoffLon',
      'Base'
    ])

    for (pickup, dropoff) in pairwise(f):
      writer.writerow(pickup[0:3] + dropoff[1:3] + [pickup[-1]])

convertCSVFiles('../unprocessed_data/', '../data/')