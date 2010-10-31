#!/usr/bin/env python

import datetime
import os
import random
import re
import json
import simplejson
import string
import sys
import urllib
import urlparse
import wsgiref.handlers

import time

from google.appengine.api import urlfetch
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import login_required

# Set to true if we want to have our webapp print stack traces, etc
_DEBUG = True

def rfc3339():
  """
    Format a date the way Atom likes it (RFC3339)
    """
  return time.strftime('%Y-%m-%dT%H:%M:%S%z')

class DataSet(db.Model):
  name = db.StringProperty(required=True)
  created = db.DateTimeProperty(auto_now_add=True)
  created_by = db.UserProperty(required=True) 

class PersonData(db.Model):
  data_set = db.ReferenceProperty(DataSet)
  gender = db.StringProperty(required=True)
  age = db.IntegerProperty(required=True)
  foot_length = db.FloatProperty(required=True)
  height = db.FloatProperty(required=True)
  stride_length = db.FloatProperty(required=False)
  created = db.DateTimeProperty(auto_now_add=True)
  created_by = db.UserProperty(required=True) 

class BaseRequestHandler(webapp.RequestHandler):
  """Supplies a common template generation function.

  When you call generate(), we augment the template variables supplied with
  the current user in the 'user' variable and the current webapp request
  in the 'request' variable.
  """
  def generate(self, template_name, template_values={}):
    values = {
          'request': self.request,
          'user': users.GetCurrentUser(),
          'login_url': users.CreateLoginURL(self.request.uri),
          'logout_url': users.CreateLogoutURL('http://' + self.request.host + '/'),
          'app_root': 'http://' + self.request.host + '/',
          'debug': self.request.get('deb'),
          'msg': self.request.get('msg'),
          'application_name': 'eanthro',
          }
    values.update(template_values)
    directory = os.path.dirname(__file__)
    path = os.path.join(directory, os.path.join('templates', template_name))
    self.response.out.write(template.render(path, values, debug=_DEBUG))

class ItemHandler(BaseRequestHandler):
  def delete(self,key=''):
    pd = PersonData.get(key);
    pd.delete()
    self.response.out.write('deleted item '+key)
    self.response.headers.add_header("Content-Type","text/plain")

class HomeHandler(BaseRequestHandler):
  @login_required
  def get(self):
    user = users.GetCurrentUser()
    self.generate('home.html')

class IndexHandler(BaseRequestHandler):
  def get(self):
    self.generate('index.html')

class FootprintsHandler(BaseRequestHandler):
  def get(self,key=''):
    self.generate('footprints.html')

class FootprintsDataSetsHandler(BaseRequestHandler):
  def get(self,key=''):
    cache=False
    sets = db.GqlQuery(
          "SELECT * from DataSet " +
          "WHERE created_by = :1 " + 
          "ORDER BY created",users.GetCurrentUser())
    self.generate('footprints_data_sets.html', {
        'sets': sets,
        })
  def post(self):
    name = self.request.get('name')
    if (name):
      set = DataSet(
          created_by = users.GetCurrentUser(),
          name=name
          )
    set.put()
    self.redirect('/exercise/footprints/data_sets')

class FootprintsDataSetJsonHandler(BaseRequestHandler):
  def get(self,key=''):
    data_set = DataSet.get(key);
    cache=False
    items = db.GqlQuery(
          "SELECT * from PersonData " +
          "WHERE data_set = :1 " + 
          "ORDER BY created",data_set)
    set = []
    for item in items:
      inner = {}
      inner['gender'] = item.gender
      inner['age'] = item.age
      inner['foot_length'] = item.foot_length
      inner['height'] = item.height
      inner['stride_length'] = item.stride_length
      inner['link'] = 'http://' + self.request.host + '/item/'+str(item.key()) 
      set.append(inner)
    self.response.out.write(json.encode(set))
    self.response.headers.add_header("Content-Type","application/json")

class FootprintsDataSetHandler(BaseRequestHandler):
  def get(self,key=''):
    data_set = DataSet.get(key);
    cache=False
    items = db.GqlQuery(
          "SELECT * from PersonData " +
          "WHERE data_set = :1 " + 
          "ORDER BY created",data_set)
    self.generate('footprints_form.html', {
      'data_set':data_set,
      'items': items,
      })
  def post(self,key=''):
    data_set = DataSet.get(key);
    gender = self.request.get('gender')
    age = int(self.request.get('age'))
    foot_length = float(self.request.get('foot_length'))
    if self.request.get('stride_length'):
      stride_length = float(self.request.get('stride_length'))
    else:
      stride_length = None
    height = float(self.request.get('height'))
    if (gender and age and foot_length and height):
      pd = PersonData(
          created_by = users.GetCurrentUser(),
          gender=gender,
          age=age,
          foot_length=foot_length,
          stride_length=stride_length,
          height=height,
          data_set=data_set
         )
      pd.put()
      self.response.out.write('added data')
    else:
      self.response.out.write('could not add data')
    self.response.headers.add_header("Content-Type","text/plain")

class FootprintsGraphHandler(BaseRequestHandler):
  def get(self,key=''):
    self.generate('footprints_graph.html')

def main():
  application = webapp.WSGIApplication([
    ('/', HomeHandler),
    ('/item/(.*)', ItemHandler),
    ('/exercise/footprints', FootprintsHandler),
    ('/exercise/footprints/data_set/(.*).json', FootprintsDataSetJsonHandler),
    ('/exercise/footprints/data_set/(.*)', FootprintsDataSetHandler),
    ('/exercise/footprints/data_sets', FootprintsDataSetsHandler),
    ('/exercise/footprints/graph', FootprintsGraphHandler),
    ], debug=_DEBUG)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
