"""
Model exported as python.
Name : mapillary_2version
Group : 
With QGIS : 32600
"""

from qgis.core import QgsProcessing
from qgis.core import QgsProcessingAlgorithm
from qgis.core import QgsProcessingMultiStepFeedback
from qgis.core import QgsProcessingParameterDateTime
from qgis.core import QgsProcessingParameterVectorLayer
from qgis.core import QgsProcessingParameterFileDestination
from qgis.core import QgsProcessingParameterFeatureSink
from qgis.core import QgsCoordinateReferenceSystem
from qgis.core import QgsExpression
import processing


class Mapillary_2version(QgsProcessingAlgorithm):

    def initAlgorithm(self, config=None):
        self.addParameter(QgsProcessingParameterDateTime('consider_pictures_from', 'consider pictures from', type=QgsProcessingParameterDateTime.Date, defaultValue=None))
        self.addParameter(QgsProcessingParameterVectorLayer('mapillarypointlayer', 'mapillary_point_layer', types=[QgsProcessing.TypeVectorPoint], defaultValue=None))
        self.addParameter(QgsProcessingParameterVectorLayer('osm_highways', 'OSM_highways', types=[QgsProcessing.TypeVectorLine], defaultValue=None))
        self.addParameter(QgsProcessingParameterFileDestination('Liste_highways_without_photos', 'liste_highways_without_photos', fileFilter='Microsoft Excel (*.xlsx);;Open Document Spreadsheet (*.ods)', createByDefault=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFileDestination('Liste_highways_without_panoramic_photos', 'liste_highways_without_panoramic_photos', fileFilter='Microsoft Excel (*.xlsx);;Open Document Spreadsheet (*.ods)', createByDefault=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFileDestination('Liste_highways_without_new_photos', 'liste_highways_without_new_photos', fileFilter='Microsoft Excel (*.xlsx);;Open Document Spreadsheet (*.ods)', createByDefault=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFeatureSink('Photos_newest', 'photos_newest', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, defaultValue='TEMPORARY_OUTPUT'))
        self.addParameter(QgsProcessingParameterFeatureSink('Photos_is_pano_true', 'photos_is_pano_true', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, defaultValue='TEMPORARY_OUTPUT'))
        self.addParameter(QgsProcessingParameterFeatureSink('Highways_with_percents_calculation', 'highways_with_percents_calculation', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, supportsAppend=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFeatureSink('Higways_without_photos', 'Higways_without_photos', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFeatureSink('Highways_without_panoramic_photos', 'Highways_without_panoramic_photos', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, defaultValue=None))
        self.addParameter(QgsProcessingParameterFeatureSink('Highways_without_new_photos', 'Highways_without_new_photos', type=QgsProcessing.TypeVectorAnyGeometry, createByDefault=True, defaultValue=None))

    def processAlgorithm(self, parameters, context, model_feedback):
        # Use a multi-step feedback, so that individual child algorithm progress reports are adjusted for the
        # overall progress through the model
        feedback = QgsProcessingMultiStepFeedback(25, model_feedback)
        results = {}
        outputs = {}

        # Reproject layer OSM
        alg_params = {
            'INPUT': parameters['osm_highways'],
            'OPERATION': '',
            'TARGET_CRS': QgsCoordinateReferenceSystem('EPSG:25833'),
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['ReprojectLayerOsm'] = processing.run('native:reprojectlayer', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(1)
        if feedback.isCanceled():
            return {}

        # Create spatial index OSM
        alg_params = {
            'INPUT': outputs['ReprojectLayerOsm']['OUTPUT']
        }
        outputs['CreateSpatialIndexOsm'] = processing.run('native:createspatialindex', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(2)
        if feedback.isCanceled():
            return {}

        # Reproject layer
        alg_params = {
            'INPUT': parameters['mapillarypointlayer'],
            'OPERATION': '',
            'TARGET_CRS': QgsCoordinateReferenceSystem('EPSG:25833'),
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['ReprojectLayer'] = processing.run('native:reprojectlayer', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(3)
        if feedback.isCanceled():
            return {}

        # Create spatial index
        alg_params = {
            'INPUT': outputs['ReprojectLayer']['OUTPUT']
        }
        outputs['CreateSpatialIndex'] = processing.run('native:createspatialindex', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(4)
        if feedback.isCanceled():
            return {}

        # Field calculator time
        # epoch to date
        alg_params = {
            'FIELD_LENGTH': 0,
            'FIELD_NAME': 'time',
            'FIELD_PRECISION': 0,
            'FIELD_TYPE': 3,  # Date
            'FORMULA': ' datetime_from_epoch( "captured_at")',
            'INPUT': outputs['CreateSpatialIndex']['OUTPUT'],
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['FieldCalculatorTime'] = processing.run('native:fieldcalculator', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(5)
        if feedback.isCanceled():
            return {}

        # Refactor fields
        alg_params = {
            'FIELDS_MAPPING': [{'expression': '"full_id"','length': 0,'name': 'full_id','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"osm_id"','length': 0,'name': 'osm_id','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"osm_type"','length': 0,'name': 'osm_type','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"bicycle"','length': 0,'name': 'bicycle','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"name"','length': 0,'name': 'name','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"maxspeed"','length': 0,'name': 'maxspeed','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"lit"','length': 0,'name': 'lit','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'},{'expression': '"highway"','length': 0,'name': 'highway','precision': 0,'sub_type': 0,'type': 10,'type_name': 'text'}],
            'INPUT': outputs['CreateSpatialIndexOsm']['OUTPUT'],
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['RefactorFields'] = processing.run('native:refactorfields', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(6)
        if feedback.isCanceled():
            return {}

        # Extract by attribute (by date)
        alg_params = {
            'FIELD': 'time',
            'INPUT': outputs['FieldCalculatorTime']['OUTPUT'],
            'OPERATOR': 2,  # >
            'VALUE': QgsExpression(' @consider_pictures_from ').evaluate(),
            'OUTPUT': parameters['Photos_newest']
        }
        outputs['ExtractByAttributeByDate'] = processing.run('native:extractbyattribute', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Photos_newest'] = outputs['ExtractByAttributeByDate']['OUTPUT']

        feedback.setCurrentStep(7)
        if feedback.isCanceled():
            return {}

        # Extract by attribute panoramic
        alg_params = {
            'FIELD': 'is_pano',
            'INPUT': outputs['FieldCalculatorTime']['OUTPUT'],
            'OPERATOR': 0,  # =
            'VALUE': 'true',
            'OUTPUT': parameters['Photos_is_pano_true']
        }
        outputs['ExtractByAttributePanoramic'] = processing.run('native:extractbyattribute', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Photos_is_pano_true'] = outputs['ExtractByAttributePanoramic']['OUTPUT']

        feedback.setCurrentStep(8)
        if feedback.isCanceled():
            return {}

        # Field calculator
        alg_params = {
            'FIELD_LENGTH': 0,
            'FIELD_NAME': 'length_osm_highway',
            'FIELD_PRECISION': 0,
            'FIELD_TYPE': 0,  # Decimal (double)
            'FORMULA': ' $length ',
            'INPUT': outputs['RefactorFields']['OUTPUT'],
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['FieldCalculator'] = processing.run('native:fieldcalculator', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(9)
        if feedback.isCanceled():
            return {}

        # Buffer highways
        alg_params = {
            'DISSOLVE': False,
            'DISTANCE': 10,
            'END_CAP_STYLE': 0,  # Round
            'INPUT': outputs['FieldCalculator']['OUTPUT'],
            'JOIN_STYLE': 0,  # Round
            'MITER_LIMIT': 2,
            'SEGMENTS': 5,
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['BufferHighways'] = processing.run('native:buffer', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(10)
        if feedback.isCanceled():
            return {}

        # Count points in polygon (general)
        alg_params = {
            'CLASSFIELD': '',
            'FIELD': 'NUMPOINTS',
            'POINTS': outputs['FieldCalculatorTime']['OUTPUT'],
            'POLYGONS': outputs['BufferHighways']['OUTPUT'],
            'WEIGHT': '',
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['CountPointsInPolygonGeneral'] = processing.run('native:countpointsinpolygon', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(11)
        if feedback.isCanceled():
            return {}

        # Field calculator (general)
        alg_params = {
            'FIELD_LENGTH': 5,
            'FIELD_NAME': 'percent_general',
            'FIELD_PRECISION': 3,
            'FIELD_TYPE': 0,  # Decimal (double)
            'FORMULA': '( "NUMPOINTS" /"length_osm_highway" ) *  100',
            'INPUT': outputs['CountPointsInPolygonGeneral']['OUTPUT'],
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['FieldCalculatorGeneral'] = processing.run('native:fieldcalculator', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(12)
        if feedback.isCanceled():
            return {}

        # Count points in polygon (nur panoramic bilder)
        alg_params = {
            'CLASSFIELD': '',
            'FIELD': 'NUMPANO',
            'POINTS': outputs['ExtractByAttributePanoramic']['OUTPUT'],
            'POLYGONS': outputs['FieldCalculatorGeneral']['OUTPUT'],
            'WEIGHT': '',
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['CountPointsInPolygonNurPanoramicBilder'] = processing.run('native:countpointsinpolygon', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(13)
        if feedback.isCanceled():
            return {}

        # Select by attribute highway without photos
        alg_params = {
            'FIELD': 'percent_general',
            'INPUT': outputs['FieldCalculatorGeneral']['OUTPUT'],
            'METHOD': 0,  # creating new selection
            'OPERATOR': 5,  # ≤
            'VALUE': '12'
        }
        outputs['SelectByAttributeHighwayWithoutPhotos'] = processing.run('qgis:selectbyattribute', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(14)
        if feedback.isCanceled():
            return {}

        # Extract selected features: highways without photos
        alg_params = {
            'INPUT': outputs['SelectByAttributeHighwayWithoutPhotos']['OUTPUT'],
            'OUTPUT': parameters['Higways_without_photos']
        }
        outputs['ExtractSelectedFeaturesHighwaysWithoutPhotos'] = processing.run('native:saveselectedfeatures', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Higways_without_photos'] = outputs['ExtractSelectedFeaturesHighwaysWithoutPhotos']['OUTPUT']

        feedback.setCurrentStep(15)
        if feedback.isCanceled():
            return {}

        # Field calculator (panoramic)
        alg_params = {
            'FIELD_LENGTH': 5,
            'FIELD_NAME': 'percent_panoramic',
            'FIELD_PRECISION': 2,
            'FIELD_TYPE': 0,  # Decimal (double)
            'FORMULA': '( "NUMPANO" /"length_osm_highway" ) *  100',
            'INPUT': outputs['CountPointsInPolygonNurPanoramicBilder']['OUTPUT'],
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['FieldCalculatorPanoramic'] = processing.run('native:fieldcalculator', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(16)
        if feedback.isCanceled():
            return {}

        # Export to spreadsheet
        alg_params = {
            'FORMATTED_VALUES': False,
            'LAYERS': outputs['ExtractSelectedFeaturesHighwaysWithoutPhotos']['OUTPUT'],
            'OVERWRITE': True,
            'USE_ALIAS': False,
            'OUTPUT': parameters['Liste_highways_without_photos']
        }
        outputs['ExportToSpreadsheet'] = processing.run('native:exporttospreadsheet', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Liste_highways_without_photos'] = outputs['ExportToSpreadsheet']['OUTPUT']

        feedback.setCurrentStep(17)
        if feedback.isCanceled():
            return {}

        # Select by attribute highway without panoramic photos
        alg_params = {
            'FIELD': 'percent_panoramic',
            'INPUT': outputs['FieldCalculatorPanoramic']['OUTPUT'],
            'METHOD': 0,  # creating new selection
            'OPERATOR': 5,  # ≤
            'VALUE': '6'
        }
        outputs['SelectByAttributeHighwayWithoutPanoramicPhotos'] = processing.run('qgis:selectbyattribute', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(18)
        if feedback.isCanceled():
            return {}

        # Count points in polygon (newest pictures)
        alg_params = {
            'CLASSFIELD': '',
            'FIELD': 'NUMNEW',
            'POINTS': outputs['ExtractByAttributeByDate']['OUTPUT'],
            'POLYGONS': outputs['FieldCalculatorPanoramic']['OUTPUT'],
            'WEIGHT': '',
            'OUTPUT': QgsProcessing.TEMPORARY_OUTPUT
        }
        outputs['CountPointsInPolygonNewestPictures'] = processing.run('native:countpointsinpolygon', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(19)
        if feedback.isCanceled():
            return {}

        # Extract selected features: highways without panoramic photos
        alg_params = {
            'INPUT': outputs['SelectByAttributeHighwayWithoutPanoramicPhotos']['OUTPUT'],
            'OUTPUT': parameters['Highways_without_panoramic_photos']
        }
        outputs['ExtractSelectedFeaturesHighwaysWithoutPanoramicPhotos'] = processing.run('native:saveselectedfeatures', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Highways_without_panoramic_photos'] = outputs['ExtractSelectedFeaturesHighwaysWithoutPanoramicPhotos']['OUTPUT']

        feedback.setCurrentStep(20)
        if feedback.isCanceled():
            return {}

        # Field calculator (newest)
        alg_params = {
            'FIELD_LENGTH': 5,
            'FIELD_NAME': 'percent_newest',
            'FIELD_PRECISION': 2,
            'FIELD_TYPE': 0,  # Decimal (double)
            'FORMULA': '( "NUMNEW" /"length_osm_highway" ) *  100',
            'INPUT': outputs['CountPointsInPolygonNewestPictures']['OUTPUT'],
            'OUTPUT': parameters['Highways_with_percents_calculation']
        }
        outputs['FieldCalculatorNewest'] = processing.run('native:fieldcalculator', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Highways_with_percents_calculation'] = outputs['FieldCalculatorNewest']['OUTPUT']

        feedback.setCurrentStep(21)
        if feedback.isCanceled():
            return {}

        # Select by attribute highway without new photos
        alg_params = {
            'FIELD': 'percent_newest',
            'INPUT': outputs['FieldCalculatorNewest']['OUTPUT'],
            'METHOD': 0,  # creating new selection
            'OPERATOR': 5,  # ≤
            'VALUE': '13.6'
        }
        outputs['SelectByAttributeHighwayWithoutNewPhotos'] = processing.run('qgis:selectbyattribute', alg_params, context=context, feedback=feedback, is_child_algorithm=True)

        feedback.setCurrentStep(22)
        if feedback.isCanceled():
            return {}

        # Export to spreadsheet
        alg_params = {
            'FORMATTED_VALUES': False,
            'LAYERS': outputs['SelectByAttributeHighwayWithoutNewPhotos']['OUTPUT'],
            'OVERWRITE': True,
            'USE_ALIAS': False,
            'OUTPUT': parameters['Liste_highways_without_new_photos']
        }
        outputs['ExportToSpreadsheet'] = processing.run('native:exporttospreadsheet', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Liste_highways_without_new_photos'] = outputs['ExportToSpreadsheet']['OUTPUT']

        feedback.setCurrentStep(23)
        if feedback.isCanceled():
            return {}

        # Export to spreadsheet
        alg_params = {
            'FORMATTED_VALUES': False,
            'LAYERS': outputs['ExtractSelectedFeaturesHighwaysWithoutPanoramicPhotos']['OUTPUT'],
            'OVERWRITE': True,
            'USE_ALIAS': False,
            'OUTPUT': parameters['Liste_highways_without_panoramic_photos']
        }
        outputs['ExportToSpreadsheet'] = processing.run('native:exporttospreadsheet', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Liste_highways_without_panoramic_photos'] = outputs['ExportToSpreadsheet']['OUTPUT']

        feedback.setCurrentStep(24)
        if feedback.isCanceled():
            return {}

        # Extract selected features:highways without new photos
        alg_params = {
            'INPUT': outputs['SelectByAttributeHighwayWithoutNewPhotos']['OUTPUT'],
            'OUTPUT': parameters['Highways_without_new_photos']
        }
        outputs['ExtractSelectedFeatureshighwaysWithoutNewPhotos'] = processing.run('native:saveselectedfeatures', alg_params, context=context, feedback=feedback, is_child_algorithm=True)
        results['Highways_without_new_photos'] = outputs['ExtractSelectedFeatureshighwaysWithoutNewPhotos']['OUTPUT']
        return results

    def name(self):
        return 'mapillary_2version'

    def displayName(self):
        return 'mapillary_2version'

    def group(self):
        return ''

    def groupId(self):
        return ''

    def createInstance(self):
        return Mapillary_2version()
