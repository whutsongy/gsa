/* Greenbone Security Assistant
 * $Id$
 * Description: Base functionalities of GSA.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/**
 * @file gsad_base.c
 * @brief Base functionality of GSA.
 */

/**
 * @brief Location of XSL file.
 */
#define XSL_PATH "gsad.xsl"

#include "gsad_base.h"
#include "tracef.h"

#include <glib.h>
#include <libexslt/exslt.h>
#include <string.h> /* for strlen() */
#include <libxslt/xsltInternals.h> /* for xsltStylesheetPtr */
#include <libxslt/transform.h> /* for xsltApplyStylesheet() */
#include <libxslt/xsltutils.h> /* for xsltSaveResultToString() */

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad base"

/**
 * @brief XSL Transformation.
 *
 * Does the transformation from XML to HTML applying omp.xsl.
 *
 * @param[in]  xml_text  The XML text to tranform.
 *
 * @return HTML output from XSL transformation, or NULL on error.
 */
char *
xsl_transform (const char *xml_text)
{
  xsltStylesheetPtr cur = NULL;
  xmlDocPtr doc, res;
  xmlChar *doc_txt_ptr = NULL;
  int doc_txt_len;

  tracef ("text to transform: [%s]\n", xml_text);

  exsltRegisterAll ();

  xmlSubstituteEntitiesDefault (1);
  xmlLoadExtDtdDefaultValue = 1;
  cur = xsltParseStylesheetFile ((const xmlChar *) XSL_PATH);
  if (cur == NULL)
    {
      g_warning ("Failed to parse stylesheet " XSL_PATH);
      return NULL;
    }

  doc = xmlParseMemory (xml_text, strlen (xml_text));
  if (doc == NULL)
    {
      g_warning ("Failed to parse stylesheet " XSL_PATH);
      xsltFreeStylesheet (cur);
      return NULL;
    }

  res = xsltApplyStylesheet (cur, doc, NULL);
  if (res == NULL)
    {
      g_warning ("Failed to apply stylesheet " XSL_PATH);
      xsltFreeStylesheet (cur);
      return NULL;
    }

  if (xsltSaveResultToString (&doc_txt_ptr, &doc_txt_len, res, cur) < 0)
    {
      g_warning ("Failed to store transformation result.");
      xsltFreeStylesheet (cur);
      xmlFreeDoc (res);
      xmlFreeDoc (doc);
      return NULL;
    }

  xsltFreeStylesheet (cur);
  xmlFreeDoc (res);
  xmlFreeDoc (doc);

  xsltCleanupGlobals ();
  xmlCleanupParser ();
  return (char *) doc_txt_ptr;
}

/**
 * @brief Handles fatal errors.
 *
 * @todo Make it accept formatted strings.
 *
 * @param[in]  credentials  User authentication information.
 * @param[in]  title     The title for the message.
 * @param[in]  function  The function in which the error occurred.
 * @param[in]  line      The line number at which the error occurred.
 * @param[in]  msg       The response message.
 * @param[in]  backurl   The URL offered to get back to a sane situation.
 *                       If NULL, the tasks page is used.
 *
 * @return An HTML document as a newly allocated string.
 */
char *
gsad_message (credentials_t *credentials, const char *title,
              const char *function, int line, const char *msg,
              const char *backurl)
{
  gchar *xml, *resp;

  xml = g_strdup_printf ("<gsad_response>"
                         "<title>%s: %s:%i</title>"
                         "<message>%s</message>"
                         "<backurl>%s</backurl>"
                         "<token>%s</token>"
                         "</gsad_response>",
                         title,
                         function,
                         line,
                         msg,
                         backurl ? backurl : "/omp?cmd=get_tasks",
                         credentials ? credentials->token : "");
  resp = xsl_transform (xml);
  if (resp == NULL)
    resp = g_strdup ("<html>"
                     "<body>"
                     "An internal server error has occurred during XSL"
                     " transformation."
                     "</body>"
                     "</html>");
  g_free (xml);
  return resp;
}
